"""Claude Agent SDK JSONL bridge. Python 3.10+; importing never starts a client.

SDK contract: https://github.com/anthropics/claude-agent-sdk-python
Only explicit session creation connects the bundled CLI. Authentication is owned
by the SDK/host environment; this bridge never reads or prints credentials.
"""
from __future__ import annotations

import asyncio
import contextlib
import importlib
import json
import sys
import uuid
from dataclasses import asdict, dataclass, field, is_dataclass


def data(value):
    if is_dataclass(value):
        return asdict(value)
    if isinstance(value, dict):
        return value
    return vars(value)


@dataclass
class Session:
    id: str
    cwd: str
    client: object = None
    task: object = None
    turn: str | None = None
    pending: dict = field(default_factory=dict)
    completed: bool = False
    cancelled: bool = False
    closed: bool = False
    worker: object = None
    queue: object = None


class Bridge:
    def __init__(self, emit=None, sdk=None):
        self.write = emit or self.write_json
        self.sdk = sdk
        self.sessions = {}
        self.stopping = False

    @staticmethod
    def write_json(value):
        sys.stdout.write(json.dumps(value, ensure_ascii=False) + "\n")
        sys.stdout.flush()

    def load_sdk(self):
        if self.sdk is None:
            self.sdk = importlib.import_module("claude_agent_sdk")
        return self.sdk

    def event(self, s, kind, **fields):
        if not s.closed and s.turn and not s.completed:
            self.write({"method": "event", "params": {
                "sessionId": s.id, "turnId": s.turn, "type": kind, **fields}})

    def complete(self, s, status, error=None):
        if not s.completed:
            self.event(s, "completed", status=status, error=error)
            s.completed = True

    async def permission(self, s, tool, inputs, _context):
        sdk = self.load_sdk()
        if not s.turn or s.cancelled or s.closed:
            return sdk.PermissionResultDeny(message="Turn is inactive", interrupt=True)
        rid = str(uuid.uuid4())
        questions = None
        if tool == "AskUserQuestion":
            questions = [{"id": str(i), "text": q["question"],
                          "choices": [{"id": str(j), "label": c["label"],
                                       "description": c.get("description")}
                                      for j, c in enumerate(q.get("options", []))],
                          "multiple": bool(q.get("multiSelect", False)), "allowCustom": True}
                         for i, q in enumerate(inputs.get("questions", []))]
        future = asyncio.get_running_loop().create_future()
        s.pending[rid] = (future, questions)
        try:
            if questions is not None:
                self.event(s, "questions", requestId=rid, text="Claude needs your input", questions=questions)
            else:
                self.event(s, "approval", requestId=rid, text=f"Allow {tool}?",
                           detail=json.dumps(inputs, ensure_ascii=False))
            response = await future
            if response["type"] == "cancel":
                return sdk.PermissionResultDeny(message="Interaction cancelled", interrupt=True)
            if questions is None:
                if response["decision"] == "allow":
                    return sdk.PermissionResultAllow(updated_input=inputs)
                return sdk.PermissionResultDeny(message="Denied by user")
            answers = {}
            for answer in response["answers"]:
                q = next(q for q in questions if q["id"] == answer["questionId"])
                selected = [next(c["label"] for c in q["choices"] if c["id"] == cid)
                            for cid in answer["choiceIds"]]
                if answer.get("customText"):
                    selected.append(answer["customText"])
                answers[q["text"]] = ", ".join(selected)
            return sdk.PermissionResultAllow(updated_input={**inputs, "answers": answers})
        finally:
            s.pending.pop(rid, None)

    def respond(self, s, rid, response):
        entry = s.pending.get(rid)
        if entry is None or entry[0].done():
            raise ValueError("Unknown or expired interaction")
        future, questions = entry
        kind = response.get("type")
        if kind == "cancel":
            pass
        elif questions is None:
            if kind != "approval" or response.get("decision") not in ("allow", "deny"):
                raise ValueError("Expected approval decision allow or deny")
        else:
            if kind != "answers" or not isinstance(response.get("answers"), list):
                raise ValueError("Expected question answers")
            remaining = {q["id"]: q for q in questions}
            for a in response["answers"]:
                q = remaining.pop(a.get("questionId"), None)
                if q is None:
                    raise ValueError("Unknown or duplicate question")
                ids = a.get("choiceIds", [])
                custom = a.get("customText")
                if not isinstance(ids, list) or any(i not in [c["id"] for c in q["choices"]] for i in ids):
                    raise ValueError("Unknown choice")
                if len(set(ids)) != len(ids) or (custom is not None and not isinstance(custom, str)):
                    raise ValueError("Invalid answer")
                count = len(ids) + bool(custom and custom.strip())
                if count == 0 or (not q["multiple"] and count != 1):
                    raise ValueError("Invalid number of answers")
            if remaining:
                raise ValueError("All questions require answers")
        future.set_result(response)

    async def create(self, options):
        sdk = self.load_sdk()
        sid = options.get("resumeId") or str(uuid.uuid4())
        if sid in self.sessions and not self.sessions[sid].closed:
            raise ValueError("Session already open")
        s = Session(sid, options["cwd"])
        kwargs = {"cwd": s.cwd, "include_partial_messages": True,
                  "permission_mode": "default", "can_use_tool":
                  lambda tool, inputs, context: self.permission(s, tool, inputs, context)}
        for source, target in (("model", "model"), ("systemPrompt", "system_prompt"), ("resumeId", "resume")):
            if options.get(source) is not None:
                kwargs[target] = options[source]
        if not options.get("resumeId"):
            kwargs["session_id"] = sid
        s.client = sdk.ClaudeSDKClient(options=sdk.ClaudeAgentOptions(**kwargs))
        self.sessions[sid] = s
        s.queue = asyncio.Queue()
        ready = asyncio.get_running_loop().create_future()
        s.worker = asyncio.create_task(self.run_session(s, ready))
        await ready
        return {"id": sid, "cwd": s.cwd, "title": None}

    async def run_session(self, s, ready):
        """Own connect/disconnect in one task (SDK/AnyIO task-group lifetime)."""
        try:
            await s.client.connect()
            ready.set_result(None)
            while True:
                command = await s.queue.get()
                if command is None:
                    break
                turn, text, result = command
                try:
                    await self.send(s, turn, text)
                    if not result.done():
                        result.set_result(None)
                except Exception as exc:
                    if not result.done():
                        result.set_exception(exc)
                finally:
                    if not result.done():
                        result.set_result(None)
        except asyncio.CancelledError:
            if not ready.done():
                ready.cancel()
        except Exception as exc:
            if not ready.done():
                ready.set_exception(RuntimeError("Claude SDK connection failed"))
        finally:
            with contextlib.suppress(Exception):
                await s.client.disconnect()
            s.closed = True

    async def send(self, s, turn, text):
        if s.task is not None:
            raise ValueError("Session already has an active turn")
        s.task = asyncio.current_task()
        s.turn, s.completed, s.cancelled = turn, False, False
        message_id = str(uuid.uuid4())
        streamed = set()
        blocks = {}
        try:
            await s.client.query(text)
            async for msg in s.client.receive_response():
                if s.cancelled:
                    continue
                payload = data(msg)
                parent = payload.get("parent_tool_use_id")
                if parent:
                    self.event(s, "metadata", name="parentToolUseId", data=parent)
                if type(msg).__name__ == "StreamEvent":
                    event = payload["event"]
                    kind = event.get("type")
                    index = event.get("index", 0)
                    if kind == "message_start":
                        message_id = event.get("message", {}).get("id", message_id)
                    bid = f"{message_id}:{index}"
                    if kind == "content_block_start":
                        blocks[index] = event["content_block"].get("type")
                    if kind == "content_block_delta":
                        delta = event["delta"]
                        if delta.get("type") == "text_delta":
                            streamed.add(bid)
                            self.event(s, "message", id=bid, text=delta["text"], phase="answer", delta=True)
                        elif delta.get("type") == "thinking_delta":
                            streamed.add(bid)
                            self.event(s, "thinking", id=bid, text=delta["thinking"], delta=True, finished=False)
                    if kind == "content_block_stop" and blocks.get(index) == "thinking":
                        self.event(s, "thinking", id=bid, text="", delta=True, finished=True)
                elif type(msg).__name__ in ("AssistantMessage", "UserMessage"):
                    mid = payload.get("message_id") or message_id
                    # Preserve block classes: dataclasses.asdict() erases SDK
                    # TextBlock/ToolUseBlock discriminants (they have no type).
                    content = getattr(msg, "content", [])
                    for i, block in enumerate(content if isinstance(content, list) else []):
                        if isinstance(block, str):
                            continue
                        b = data(block)
                        kind = b.get("type") or type(block).__name__
                        bid = f"{mid}:{i}"
                        if kind in ("text", "TextBlock") and bid not in streamed:
                            self.event(s, "message", id=bid, text=b["text"], phase="answer", delta=False)
                        elif kind in ("thinking", "ThinkingBlock") and bid not in streamed:
                            self.event(s, "thinking", id=bid, text=b["thinking"], delta=False, finished=True)
                        elif kind in ("tool_use", "ToolUseBlock"):
                            self.event(s, "activity", id=b["id"], label=b["name"], text=json.dumps(b["input"]), output="", status="running")
                        elif kind in ("tool_result", "ToolResultBlock"):
                            self.event(s, "activity", id=b["tool_use_id"], label="Tool result", text="", output=json.dumps(b.get("content")), status="failed" if b.get("is_error") else "completed")
                elif type(msg).__name__ == "ResultMessage":
                    self.event(s, "metadata", name="result", data=payload)
                    self.complete(s, "failed" if payload.get("is_error") else "completed",
                                  payload.get("result") if payload.get("is_error") else None)
                elif type(msg).__name__ == "SystemMessage":
                    self.event(s, "metadata", name=payload["subtype"], data=payload["data"])
            self.complete(s, "cancelled" if s.cancelled else "completed")
        except asyncio.CancelledError:
            self.complete(s, "cancelled")
            raise
        except Exception:
            self.complete(s, "failed", "Claude SDK turn failed; check host SDK configuration")
            raise RuntimeError("Claude SDK turn failed") from None
        finally:
            for future, _ in list(s.pending.values()):
                if not future.done():
                    future.set_result({"type": "cancel"})
            s.task = None

    async def cancel(self, s):
        s.cancelled = True
        if s.task is None and s.queue is not None and not s.queue.empty():
            command = s.queue.get_nowait()
            if command is not None:
                turn, _text, result = command
                s.turn, s.completed = turn, False
                self.complete(s, "cancelled")
                if not result.done():
                    result.set_result(None)
        for future, _ in list(s.pending.values()):
            if not future.done():
                future.set_result({"type": "cancel"})
        if s.task is not None:
            try:
                await asyncio.wait_for(s.client.interrupt(), 5)
            except Exception:
                s.worker.cancel()
                await s.worker
                return
            # Drain the interrupted response before a subsequent turn can start.
            # If the transport stalls, close it rather than reusing stale output.
            async def drained():
                while s.task is not None:
                    await asyncio.sleep(0.01)
            try:
                await asyncio.wait_for(drained(), 5)
            except asyncio.TimeoutError:
                s.worker.cancel()
                await s.worker

    async def shutdown(self):
        self.stopping = True
        for s in self.sessions.values():
            if s.task:
                await self.cancel(s)
            if not s.closed:
                await s.queue.put(None)
                await s.worker

    async def dispatch(self, method, p):
        if method == "initialize":
            sdk = self.load_sdk()
            return {"resume": True, "listSessions": hasattr(sdk, "list_sessions"),
                    "approvals": True, "questions": True, "tools": True, "artifacts": False}
        if method == "session/create":
            return await self.create(p)
        if method == "session/list":
            sdk = self.load_sdk()
            if not hasattr(sdk, "list_sessions"):
                raise ValueError("Session listing unsupported by installed SDK")
            entries = await asyncio.to_thread(sdk.list_sessions)
            return [{"id": e.session_id, "title": getattr(e, "custom_title", None) or getattr(e, "summary", None),
                     "cwd": getattr(e, "cwd", None)} for e in entries]
        if method == "shutdown":
            await self.shutdown()
            return None
        s = self.sessions[p["sessionId"]]
        if s.closed:
            raise ValueError("Session closed; create a resumed session to continue")
        if method == "turn/send":
            if s.task or not s.queue.empty():
                raise ValueError("Session already has an active turn")
            result = asyncio.get_running_loop().create_future()
            await s.queue.put((p["turnId"], p["text"], result))
            return await result
        if method == "turn/cancel":
            return await self.cancel(s)
        if method == "interaction/respond":
            return self.respond(s, p["requestId"], p["response"])
        raise ValueError("Unknown method")

    async def request(self, request):
        rid = request.get("id")
        try:
            result = await self.dispatch(request["method"], request.get("params") or {})
            self.write({"id": rid, "result": result})
        except Exception as exc:
            # Arbitrary SDK errors can contain transport/authentication details.
            message = str(exc) if isinstance(exc, ValueError) else "Claude helper request failed"
            self.write({"id": rid, "error": {"message": message}})


async def main():
    bridge = Bridge()
    tasks = set()
    try:
        while not bridge.stopping:
            line = await asyncio.to_thread(sys.stdin.readline)
            if not line:
                break
            try:
                request = json.loads(line)
                if not isinstance(request, dict):
                    raise ValueError()
            except (ValueError, TypeError):
                bridge.write({"id": None, "error": {"message": "Invalid JSON request"}})
                continue
            if request.get("method") == "shutdown":
                await bridge.request(request)
                break
            task = asyncio.create_task(bridge.request(request))
            tasks.add(task)
            task.add_done_callback(tasks.discard)
    finally:
        await bridge.shutdown()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)


if __name__ == "__main__":
    asyncio.run(main())
