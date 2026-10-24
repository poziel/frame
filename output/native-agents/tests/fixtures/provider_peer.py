"""Strict offline JSONL peers for Rust connector integration tests."""
import json
import sys

provider, scenario = sys.argv[1:]
initialized = False
created = 0
active = None
send_request = None


def out(value):
    print(json.dumps(value), flush=True)


def reply(request, result):
    out({"id": request["id"], "result": result})


def event(kind, **fields):
    out({"method": "event", "params": {"sessionId": "s1", "turnId": "host-turn", "type": kind, **fields}})


def codex(method, **fields):
    out({"method": method, "params": {"threadId": "s1", "turnId": "native-turn", **fields}})


def finish(cancelled=False):
    if provider == "claude":
        event("completed", status="stopped" if cancelled else "complete", error=None)
        reply(send_request, None)
    else:
        codex("turn/completed", turn={"id": "native-turn", "status": "interrupted" if cancelled else "completed"})


for line in sys.stdin:
    request = json.loads(line)
    method, p = request.get("method"), request.get("params")
    if method == "initialize":
        assert not initialized
        if provider == "codex":
            assert p == {"clientInfo": {"name": "frame_agents", "title": "Frame agents", "version": "0.1.0"}}
        else:
            assert p == {}
        initialized = True
        reply(request, {"resume": True, "listSessions": True, "approvals": True, "questions": True, "tools": True, "artifacts": False})
    elif method == "initialized":
        assert provider == "codex" and initialized and p == {}
        initialized = "notified"
    elif method in ("thread/start", "thread/resume", "session/create"):
        assert initialized == ("notified" if provider == "codex" else True)
        created += 1
        resume = created == 2
        sid = "resumed" if resume else "s1"
        if provider == "codex":
            expected = {"cwd": "test-workspace", "approvalPolicy": "on-request", "sandbox": "readOnly", "model": "test-model", "developerInstructions": "test-system"}
            if resume:
                expected.update(threadId="resumed", excludeTurns=True)
            assert method == ("thread/resume" if resume else "thread/start")
            assert p == expected, (p, expected)
            reply(request, {"thread": {"id": sid, "name": "Test session"}})
        else:
            assert p == {"cwd": "test-workspace", "model": "test-model", "systemPrompt": "test-system", "resumeId": "resumed" if resume else None}
            reply(request, {"id": sid, "title": "Test session", "cwd": "test-workspace"})
    elif method in ("thread/list", "session/list"):
        if provider == "codex":
            assert p == {"limit": 100, "cursor": None}
            reply(request, {"data": [{"id": "history", "preview": "Earlier", "cwd": "test-workspace"}], "nextCursor": None})
        else:
            assert p == {}
            reply(request, [{"id": "history", "title": "Earlier", "cwd": "test-workspace"}])
    elif method in ("turn/start", "turn/send"):
        assert created == 2
        send_request = request
        if provider == "codex":
            assert p == {"threadId": "s1", "input": [{"type": "text", "text": "test prompt"}]}
            reply(request, {"turn": {"id": "native-turn"}})
            out({"method": "item/agentMessage/delta", "params": {"threadId": "other", "turnId": "native-turn", "itemId": "bad", "delta": "LEAK"}})
            out({"method": "item/agentMessage/delta", "params": {"threadId": "s1", "turnId": "old-turn", "itemId": "bad", "delta": "STALE"}})
            codex("item/agentMessage/delta", itemId="m", delta="Hello")
            codex("item/completed", item={"id": "m", "type": "agentMessage", "phase": "final_answer", "text": "Hello world"})
        else:
            assert p == {"sessionId": "s1", "turnId": "host-turn", "text": "test prompt"}
            out({"method": "event", "params": {"sessionId": "other", "turnId": "host-turn", "type": "message", "id": "bad", "text": "LEAK", "phase": "final", "delta": False}})
            out({"method": "event", "params": {"sessionId": "s1", "turnId": "old-turn", "type": "message", "id": "bad", "text": "STALE", "phase": "final", "delta": False}})
            event("message", id="m", text="Hello", phase="intermediate", delta=True)
            event("message", id="m", text="Hello world", phase="final", delta=False)
        if scenario == "disconnect":
            sys.exit(0)
        if scenario == "stream":
            finish()
        elif provider == "codex":
            out({"id": 900, "method": "item/tool/requestUserInput", "params": {"threadId": "s1", "turnId": "native-turn", "questions": [{"id": "style", "question": "Style?", "isOther": True, "options": [{"label": "Pixel", "description": "Small"}]}]}})
        else:
            event("questions", requestId="q", text="Style?", questions=[{"id": "style", "text": "Style?", "choices": [{"id": "0", "label": "Pixel", "description": "Small"}], "multiple": False, "allowCustom": True}])
    elif method is None and provider == "codex":
        assert request["id"] == 900
        assert request["result"] == ({"answers": {}} if scenario == "cancel" else {"answers": {"style": {"answers": ["Pixel"]}}})
        if scenario == "questions":
            finish()
    elif method == "interaction/respond":
        assert provider == "claude" and p == {"sessionId": "s1", "requestId": "q", "response": {"type": "answers", "answers": [{"questionId": "style", "choiceIds": ["0"], "customText": None}]}}
        reply(request, None)
        finish()
    elif method in ("turn/interrupt", "turn/cancel"):
        assert scenario == "cancel"
        assert p == ({"threadId": "s1", "turnId": "native-turn"} if provider == "codex" else {"sessionId": "s1"})
        reply(request, None)
        finish(True)
    elif method == "shutdown":
        assert provider == "claude"
        reply(request, None)
        break
    else:
        raise AssertionError((method, p))
