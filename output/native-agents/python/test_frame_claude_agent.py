"""Offline protocol tests: no SDK install, CLI, credentials, or AI requests."""
import asyncio
import unittest
from dataclasses import dataclass
from types import SimpleNamespace

from frame_claude_agent import Bridge, Session


def message(name, **fields):
    return type(name, (), {"__init__": lambda self: self.__dict__.update(fields)})()


class FakeClient:
    def __init__(self, options):
        self.options = options
        self.messages = []
        self.connected = False
        self.owner = None

    async def connect(self):
        self.owner = asyncio.current_task()
        self.connected = True

    async def disconnect(self):
        assert self.owner == asyncio.current_task()
        self.connected = False

    async def query(self, text):
        self.text = text

    async def receive_response(self):
        for m in self.messages:
            yield m

    async def interrupt(self):
        pass


SDK = SimpleNamespace(ClaudeSDKClient=FakeClient,
                      ClaudeAgentOptions=lambda **kw: SimpleNamespace(**kw),
                      PermissionResultAllow=lambda **kw: {"behavior": "allow", **kw},
                      PermissionResultDeny=lambda **kw: {"behavior": "deny", **kw},
                      list_sessions=lambda: [SimpleNamespace(session_id="old", summary="Earlier", cwd=".")])


class BridgeTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.events = []
        self.bridge = Bridge(self.events.append, SDK)
        self.info = await self.bridge.create({"cwd": "."})
        self.s = self.bridge.sessions[self.info["id"]]

    async def asyncTearDown(self):
        await self.bridge.shutdown()

    def normalized(self, kind):
        return [e["params"] for e in self.events if e.get("params", {}).get("type") == kind]

    async def test_stream_deduplicates_and_maps_tools_results(self):
        self.s.client.messages = [
            message("StreamEvent", event={"type": "message_start", "message": {"id": "m"}}),
            message("StreamEvent", event={"type": "content_block_delta", "index": 0,
                                         "delta": {"type": "text_delta", "text": "Hello"}}),
            message("AssistantMessage", message_id="m", parent_tool_use_id="parent",
                    content=[{"type": "text", "text": "Hello"},
                             {"type": "tool_use", "id": "tool", "name": "Read", "input": {"path": "a"}}]),
            message("UserMessage", content=[{"type": "tool_result", "tool_use_id": "tool", "content": "ok"}]),
            message("ResultMessage", session_id=self.s.id, is_error=False, usage={"input_tokens": 1}, result="Hello"),
        ]
        await self.bridge.dispatch("turn/send", {"sessionId": self.s.id, "turnId": "t", "text": "hi"})
        self.assertEqual([e["text"] for e in self.normalized("message")], ["Hello"])
        self.assertEqual([e["status"] for e in self.normalized("activity")], ["running", "completed"])
        self.assertEqual(len(self.normalized("completed")), 1)
        self.assertEqual(self.normalized("metadata")[0]["data"], "parent")
        self.assertTrue(self.s.client.connected)

    async def test_approval_and_validation(self):
        self.s.turn = "t"
        task = asyncio.create_task(self.bridge.permission(self.s, "Bash", {"command": "echo hi"}, None))
        await asyncio.sleep(0)
        rid = self.normalized("approval")[0]["requestId"]
        with self.assertRaises(ValueError):
            self.bridge.respond(self.s, rid, {"type": "approval", "decision": "always"})
        self.bridge.respond(self.s, rid, {"type": "approval", "decision": "allow"})
        self.assertEqual((await task)["behavior"], "allow")
        with self.assertRaises(ValueError):
            self.bridge.respond(self.s, rid, {"type": "cancel"})

    async def test_questions_choices_custom_and_cancel(self):
        self.s.turn = "t"
        inputs = {"questions": [{"question": "Pick", "options": [{"label": "One"}, {"label": "Two"}], "multiSelect": True},
                                {"question": "Other", "options": []}]}
        task = asyncio.create_task(self.bridge.permission(self.s, "AskUserQuestion", inputs, None))
        await asyncio.sleep(0)
        rid = self.normalized("questions")[0]["requestId"]
        with self.assertRaises(ValueError):
            self.bridge.respond(self.s, rid, {"type": "answers", "answers": [{"questionId": "0", "choiceIds": ["bad"]}]})
        self.bridge.respond(self.s, rid, {"type": "answers", "answers": [
            {"questionId": "0", "choiceIds": ["0", "1"]},
            {"questionId": "1", "choiceIds": [], "customText": "custom"}]})
        self.assertEqual((await task)["updated_input"]["answers"], {"Pick": "One, Two", "Other": "custom"})
        task = asyncio.create_task(self.bridge.permission(self.s, "Bash", {}, None))
        await asyncio.sleep(0)
        await self.bridge.cancel(self.s)
        self.assertEqual((await task)["behavior"], "deny")
        self.assertFalse(self.s.pending)

    async def test_cancel_drains_and_reuses_session_without_stale_output(self):
        started, released = asyncio.Event(), asyncio.Event()
        async def receive():
            started.set()
            await released.wait()
            yield message("AssistantMessage", content=[{"type": "text", "text": "stale"}])
            yield message("ResultMessage", is_error=False)
        async def interrupt():
            released.set()
        self.s.client.receive_response = receive
        self.s.client.interrupt = interrupt
        send = asyncio.create_task(self.bridge.dispatch("turn/send", {"sessionId": self.s.id, "turnId": "t", "text": "hi"}))
        await started.wait()
        await self.bridge.cancel(self.s)
        await send
        self.assertFalse(self.normalized("message"))
        self.assertEqual(self.normalized("completed")[0]["status"], "cancelled")
        self.assertTrue(self.s.client.connected)
        self.assertIsNone(self.s.task)

    async def test_capabilities_history_and_errors(self):
        self.assertTrue((await self.bridge.dispatch("initialize", {}))["listSessions"])
        self.assertEqual((await self.bridge.dispatch("session/list", {}))[0]["id"], "old")
        await self.bridge.request({"id": 1, "method": "unknown", "params": {"sessionId": self.s.id}})
        self.assertEqual(self.events[-1], {"id": 1, "error": {"message": "Unknown method"}})

    async def test_sdk_dataclass_blocks_keep_their_types(self):
        @dataclass
        class TextBlock:
            text: str
        @dataclass
        class ThinkingBlock:
            thinking: str
        @dataclass
        class AssistantMessage:
            content: list
        self.s.client.messages = [AssistantMessage([TextBlock("Hello"), ThinkingBlock("Considering")])]
        await self.bridge.dispatch("turn/send", {"sessionId": self.s.id, "turnId": "t", "text": "hi"})
        self.assertEqual(self.normalized("message")[0]["text"], "Hello")
        self.assertEqual(self.normalized("thinking")[0]["text"], "Considering")

    async def test_independent_sessions_and_single_choice_validation(self):
        other = await self.bridge.create({"cwd": "other"})
        self.assertNotEqual(self.s.id, other["id"])
        self.s.turn = "t"
        task = asyncio.create_task(self.bridge.permission(self.s, "AskUserQuestion", {
            "questions": [{"question": "Choose", "options": [{"label": "a"}, {"label": "b"}]}]}, None))
        await asyncio.sleep(0)
        rid = self.normalized("questions")[0]["requestId"]
        with self.assertRaises(ValueError):
            self.bridge.respond(self.bridge.sessions[other["id"]], rid, {"type": "cancel"})
        with self.assertRaises(ValueError):
            self.bridge.respond(self.s, rid, {"type": "answers", "answers": [
                {"questionId": "0", "choiceIds": ["0", "1"]}]})
        self.bridge.respond(self.s, rid, {"type": "cancel"})
        self.assertEqual((await task)["behavior"], "deny")


if __name__ == "__main__":
    unittest.main()
