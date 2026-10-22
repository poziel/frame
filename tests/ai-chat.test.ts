import { expect, test } from "bun:test";
import { createAIChat, type ChatResponseWriter } from "../packages/features/src/aiChat";
import { groupChatParts } from "../packages/features/src/chatParts";

test("presentation merges adjacent parts without changing source IDs or crossing type boundaries", () => {
  const parts = [
    { id: "t1", type: "thinking" as const, text: "One", startedAt: 10, finishedAt: 20 },
    { id: "t2", type: "thinking" as const, text: "Two", startedAt: 20, finishedAt: 30 },
    { id: "m1", type: "message" as const, text: "First" },
    { id: "m2", type: "message" as const, text: "Second" },
    { id: "t3", type: "thinking" as const, text: "Three", startedAt: 40, finishedAt: 50 },
    { id: "t4", type: "thinking" as const, text: "Four", startedAt: 50 },
    { id: "m3", type: "message" as const, text: "Last" },
  ];
  const groups = groupChatParts(parts);
  expect(groups.map(part => part.type)).toEqual(["thinking", "message", "thinking", "message"]);
  expect(groups.map(part => part.text)).toEqual(["One\n\nTwo", "First\n\nSecond", "Three\n\nFour", "Last"]);
  expect(groups[0]).toMatchObject({ id: "t1", startedAt: 10, finishedAt: 30 });
  expect(groups[2]).toMatchObject({ id: "t3", startedAt: 40, finishedAt: undefined });
  expect(parts[0].text).toBe("One"); expect(parts).toHaveLength(7);
});

test("ordered response parts belong to one explicitly completed generation", async () => {
  const chat = createAIChat({ respond(request, writer) {
    expect(request.prompt).toBe("Hello");
    expect(request.messages.map(message => message.role)).toEqual(["user"]);
    const first = writer.thinking("Reading");
    writer.updateThinking(first, "Read the message"); writer.finishThinking(first);
    const answer = writer.message("One"); writer.append(answer, " more");
    writer.thinking("Checking"); writer.message("Two"); writer.complete();
    writer.message("Late data must be ignored");
  } });
  chat.state.draft = " Hello "; await chat.send();
  const generation = chat.state.messages[1]!;
  expect(generation.parts.map(part => part.type)).toEqual(["thinking", "message", "thinking", "message"]);
  expect(generation.parts.map(part => part.text)).toEqual(["Read the message", "One more", "Checking", "Two"]);
  expect(generation.parts.filter(part => part.type === "thinking").every(part => !!part.finishedAt)).toBe(true);
  expect(generation.status).toBe("complete"); expect(generation.finishedAt).toBeGreaterThanOrEqual(generation.createdAt);
  expect(chat.state.busy).toBe(false);
});

test("rewind preserves history and draft until committed, and toggles to cancel", async () => {
  const chat = createAIChat({ respond: (_request, writer) => { writer.message("Reply"); } });
  chat.state.draft = "Original"; await chat.send();
  chat.state.draft = "Follow up"; await chat.send();
  const original = chat.state.messages[0]!;
  chat.state.draft = "Unsent";
  chat.state.attachments = [{ id: "context", name: "Local context", kind: "context" }];
  chat.rewind(original.id);
  expect(chat.state.draft).toBe("Original"); expect(chat.state.messages).toHaveLength(4);
  chat.state.draft = "Temporary edit"; chat.rewind(original.id);
  expect(chat.state.draft).toBe("Unsent"); expect(chat.state.attachments[0]?.id).toBe("context");
  expect(chat.state.messages).toHaveLength(4);
  chat.rewind(original.id); chat.state.draft = "Replacement"; await chat.send();
  expect(chat.state.messages).toHaveLength(2);
  expect(chat.state.messages[0]?.parts[0]?.text).toBe("Replacement");
});

test("stop aborts the backend and ignores stale events across subsequent sends", async () => {
  let oldWriter: ChatResponseWriter | undefined;
  let release!: () => void;
  let aborted = false;
  let calls = 0;
  const chat = createAIChat({ async respond(request, writer) {
    if (++calls > 1) { writer.message("New reply"); return; }
    oldWriter = writer; writer.thinking("Working");
    request.signal.addEventListener("abort", () => { aborted = true; });
    await new Promise<void>(resolve => { release = resolve; });
    writer.message("Stale reply");
  } });
  chat.state.draft = "First"; const task = chat.send();
  chat.state.draft = "Ignored while busy"; expect(await chat.send()).toBe(false);
  chat.stop(); expect(aborted).toBe(true);
  expect(chat.state.messages[1]?.status).toBe("stopped");
  chat.state.draft = "Second"; await chat.send();
  oldWriter!.message("More stale data"); release(); await task;
  expect(chat.state.messages[1]?.parts).toHaveLength(1);
  expect(chat.state.messages[3]?.parts[0]?.text).toBe("New reply");
  expect(chat.state.busy).toBe(false);
});

test("errors finish thinking and keep the conversation usable; whitespace never sends", async () => {
  const chat = createAIChat({ respond(_request, writer) { writer.thinking("Reading"); throw new Error("Offline"); } });
  chat.state.draft = "  \n"; expect(await chat.send()).toBe(false); expect(chat.state.messages).toHaveLength(0);
  chat.state.draft = "Hello"; await chat.send();
  expect(chat.state.messages[1]?.error).toBe("Offline"); expect(chat.state.messages[1]?.status).toBe("error");
  expect(chat.state.messages[1]?.parts[0]).toHaveProperty("finishedAt"); expect(chat.state.busy).toBe(false);
});

test("forge snapshots are independent and end at the selected assistant response", async () => {
  const chat = createAIChat({ respond: (_request, writer) => { writer.message("Reply"); } });
  chat.state.draft = "First"; await chat.send();
  const responseId = chat.state.messages[1]!.id;
  chat.state.draft = "Second"; await chat.send();
  const snapshot = chat.fork(responseId);
  expect(snapshot).toHaveLength(2);
  snapshot[0]!.parts[0]!.text = "Changed";
  expect(chat.state.messages[0]!.parts[0]!.text).toBe("First");
  expect(chat.fork("missing")).toEqual([]);
});
