import { expect, test } from "bun:test";
import { createAIChat, type ChatResponseWriter } from "../packages/features/src/aiChat";
import { groupChatParts, splitChatTurn } from "../packages/features/src/chatParts";
import * as chatPresentation from "../packages/features/src/chatParts";
import { watch } from "vue";

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
  expect(groups.map(part => part.text)).toEqual(["One\nTwo", "First\n\nSecond", "Three\nFour", "Last"]);
  expect(groups[0]).toMatchObject({ id: "t1", startedAt: 10, finishedAt: 30 });
  expect(groups[2]).toMatchObject({ id: "t3", startedAt: 40, finishedAt: undefined });
  expect(parts[0].text).toBe("One"); expect(parts).toHaveLength(7);
});

test("work history is separate from final answers and delivered artifacts without changing source order", async () => {
  const chat = createAIChat({ respond(_request, writer) {
    writer.thinking("Considering");
    writer.message("An early observation", { phase: "intermediate" });
    writer.activity({ label: "Inspect files" });
    writer.message("The final answer");
    writer.artifact({ name: "result.txt", kind: "file", url: "blob:result" });
  } });
  chat.state.draft = "Go"; await chat.send();
  const original = chat.state.messages[1]!.parts;
  const { work, answer } = splitChatTurn(original);
  expect(work.map(part => part.type)).toEqual(["thinking", "message", "activity"]);
  expect(work[1]).toMatchObject({ phase: "intermediate", text: "An early observation" });
  expect(answer.map(part => part.type)).toEqual(["message", "artifact"]);
  expect(original.map(part => part.type)).toEqual(["thinking", "message", "activity", "message", "artifact"]);
  expect(groupChatParts([
    { id: "a", type: "message", text: "Intermediate", phase: "intermediate" },
    { id: "b", type: "message", text: "Final", phase: "final" },
  ])).toHaveLength(2);
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

test("rich events remain ordered and only compatible text parts group", async () => {
  const chat = createAIChat({ respond(_request, writer) {
    writer.commentary("Checking files");
    writer.commentary("Still checking");
    const activity = writer.activity({ label: "Read files", text: "Starting" });
    writer.updateActivity(activity, { text: "Read two files", output: "a.ts\nb.ts" });
    writer.finishActivity(activity, "failed");
    writer.artifact({ name: "preview.png", url: "blob:preview", kind: "image", mimeType: "image/png" });
    writer.message("Done");
  } });
  chat.state.draft = "Inspect"; await chat.send();
  const parts = chat.state.messages[1]!.parts;
  expect(parts.map(part => part.type)).toEqual(["commentary", "commentary", "activity", "artifact", "message"]);
  expect(groupChatParts(parts)).toHaveLength(5);
  expect(parts[2]).toMatchObject({ label: "Read files", status: "failed", output: "a.ts\nb.ts" });
});

test("approval decisions settle once and completion cannot discard pending requests", async () => {
  let writer!: ChatResponseWriter;
  const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
  chat.state.draft = "Work"; const task = chat.send();
  const approval = writer.requestApproval({ text: "Edit the file?", detail: "Changes local content" });
  expect(writer.complete()).toBe(false);
  expect(chat.state.busy).toBe(true);
  expect(chat.resolveApproval(approval.id, "invalid" as "allow")).toBe(false);
  expect(chat.resolveApproval(approval.id, "allow")).toBe(true);
  expect(await approval.result).toEqual({ status: "answered", decision: "allow" });
  expect(chat.resolveApproval(approval.id, "deny")).toBe(false);
  expect(writer.complete()).toBe(true); await task;
  expect(chat.state.messages[1]!.parts[0]).toMatchObject({ status: "answered", decision: "allow" });
});

test("questions validate named choices, required answers and custom single versus multiple answers", async () => {
  let writer!: ChatResponseWriter;
  const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
  chat.state.draft = "Choose"; const task = chat.send();
  const questions = [
    { id: "style", text: "Which style?", choices: [{ id: "a", label: "Pixel" }, { id: "b", label: "Vector" }], allowCustom: true },
    { id: "formats", text: "Which formats?", choices: [{ id: "png", label: "PNG" }, { id: "gif", label: "GIF" }], multiple: true, allowCustom: true },
  ];
  const request = writer.askQuestions({ text: "A few questions", questions });
  questions[0]!.choices[0]!.label = "Mutated";
  expect(chat.answerQuestions(request.id, [])).toBe(false);
  const formats = { questionId: "formats", choiceIds: ["png", "gif"], customText: "WebP" };
  for (const answer of [
    { questionId: "style", choiceIds: ["unknown"] },
    { questionId: "style", choiceIds: ["a", "b"] },
    { questionId: "style", choiceIds: ["a"], customText: "Other" },
    { questionId: "style", choiceIds: [], customText: "   " },
    { questionId: "style", choiceIds: ["a", "a"] },
  ]) expect(chat.answerQuestions(request.id, [answer, formats])).toBe(false);
  const answers = [{ questionId: "style", choiceIds: [], customText: "  Hand drawn  " }, formats];
  expect(chat.answerQuestions(request.id, answers)).toBe(true);
  answers[1]!.choiceIds.push("corrupt");
  expect(await request.result).toEqual({ status: "answered", answers: [
    { questionId: "style", choiceIds: [], customText: "Hand drawn" },
    { questionId: "formats", choiceIds: ["png", "gif"], customText: "WebP" },
  ] });
  expect(chat.answerQuestions(request.id, [])).toBe(false);
  const snapshot = chat.fork(chat.state.messages[1]!.id);
  expect(snapshot).toEqual([]); // Pending responses cannot be forked.
  writer.complete(); await task;
  const fork = chat.fork(chat.state.messages[1]!.id);
  const part = fork[1]!.parts[0]!;
  if (part.type !== "question") throw new Error("Expected question");
  part.questions[0]!.choices[0]!.label = "Changed snapshot";
  part.answers![1]!.choiceIds.push("changed");
  const original = chat.state.messages[1]!.parts[0]!;
  if (original.type !== "question") throw new Error("Expected question");
  expect(original.questions[0]!.choices[0]!.label).toBe("Pixel");
  expect(original.answers![1]!.choiceIds).toEqual(["png", "gif"]);
});

test("question schemas reject duplicate IDs and custom text cannot bypass configuration", async () => {
  let writer!: ChatResponseWriter;
  const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
  chat.state.draft = "Hello"; const task = chat.send();
  const question = { id: "q", text: "Pick", choices: [{ id: "a", label: "A" }] };
  expect(() => writer.askQuestions({ questions: [question, question] })).toThrow();
  const handle = writer.askQuestions({ questions: [question, { id: "optional", text: "Optional", choices: [], allowCustom: true, required: false }] });
  expect(chat.answerQuestions(handle.id, [{ questionId: "q", choiceIds: [], customText: "A" }])).toBe(false);
  expect(chat.answerQuestions(handle.id, [{ questionId: "q", choiceIds: ["a"] }, { questionId: "q", choiceIds: ["a"] }])).toBe(false);
  expect(chat.answerQuestions(handle.id, [{ questionId: "q", choiceIds: ["a"] }, { questionId: "extra", choiceIds: [] }])).toBe(false);
  expect(chat.answerQuestions(handle.id, [{ questionId: "q", choiceIds: ["a"] }])).toBe(true);
  expect(await handle.result).toEqual({ status: "answered", answers: [{ questionId: "q", choiceIds: ["a"] }, { questionId: "optional", choiceIds: [] }] });
  writer.complete(); await task;
});

test("stop settles ignored responders, cancels requests and ignores old writers in later turns", async () => {
  let writer!: ChatResponseWriter;
  const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
  chat.state.draft = "First"; const first = chat.send();
  const old = writer;
  const approval = old.requestApproval({ text: "Allow?" });
  const question = old.askQuestions({ questions: [{ id: "q", text: "Name?", choices: [], allowCustom: true }] });
  old.activity({ label: "Running" });
  chat.stop(); await first;
  expect(await approval.result).toEqual({ status: "cancelled" });
  expect(await question.result).toEqual({ status: "cancelled" });
  expect(chat.state.messages[1]!.parts[2]).toMatchObject({ status: "cancelled" });
  chat.state.draft = "Second"; const second = chat.send();
  old.message("Late"); old.fail("Late failure"); old.complete();
  const stale = old.requestApproval({ text: "Too late" });
  expect(await stale.result).toEqual({ status: "cancelled" });
  expect(chat.resolveApproval(approval.id, "allow")).toBe(false);
  expect(chat.state.busy).toBe(true);
  expect(chat.state.messages[3]!.parts).toEqual([]);
  writer.fail("Simulated failure"); await second;
  expect(chat.state.messages[3]).toMatchObject({ status: "error", error: "Simulated failure" });
});

test("controllers isolate interactions and disposal cancels requests permanently", async () => {
  let writer!: ChatResponseWriter;
  const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
  const other = createAIChat({ respond() {} });
  chat.state.draft = "First"; const task = chat.send();
  const handle = writer.requestApproval({ text: "Allow?" });
  expect(other.resolveApproval(handle.id, "allow")).toBe(false);
  expect(chat.cancelInteraction(handle.id)).toBe(true);
  expect(await handle.result).toEqual({ status: "cancelled" });
  const next = writer.requestApproval({ text: "Another" });
  chat.dispose(); await task;
  expect(await next.result).toEqual({ status: "cancelled" });
  chat.state.draft = "After disposal";
  expect(await chat.send()).toBe(false);
});

test("synchronous host cancellation observes registered interactions and settles their promises", async () => {
  for (const kind of ["approval", "question"] as const) {
    let writer!: ChatResponseWriter;
    const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
    chat.state.draft = "Go"; const task = chat.send();
    const unwatch = watch(() => chat.state.messages[1]?.parts.length, length => { if (length) chat.stop(); }, { flush: "sync" });
    const handle = kind === "approval" ? writer.requestApproval({ text: "Proceed?" }) : writer.askQuestions({ questions: [{ id: "q", text: "Name?", choices: [], allowCustom: true }] });
    expect(await Promise.race([handle.result, Promise.resolve("unsettled")])).toEqual({ status: "cancelled" });
    expect(chat.state.messages[1]!.parts[0]).toMatchObject({ status: "cancelled" });
    await task; unwatch(); chat.dispose();
  }
});

test("activity groups split at commentary and interactions while thoughts stay transient", () => {
  expect(chatPresentation.buildChatWorkTimeline).toBeFunction();
  const activity = (id: string) => ({ id, type: "activity" as const, label: id, text: "", output: "", status: "running" as const, startedAt: 10 });
  const parts = [
    { id: "c1", type: "commentary" as const, text: "Inspecting" },
    activity("a1"),
    { id: "t1", type: "thinking" as const, text: "Old thought", startedAt: 10, finishedAt: 15 },
    activity("a2"),
    { id: "c2", type: "commentary" as const, text: "Fixing" },
    activity("a3"),
    { id: "approval", type: "approval" as const, text: "Allow?", status: "pending" as const },
    activity("a4"),
    { id: "t2", type: "thinking" as const, text: "Current thought", startedAt: 20 },
  ];
  const timeline = chatPresentation.buildChatWorkTimeline(parts);
  expect(timeline.items.map(item => item.type)).toEqual(["commentary", "activityGroup", "commentary", "activityGroup", "approval", "activityGroup"]);
  const first = timeline.items[1]!;
  if (first.type !== "activityGroup") throw new Error("Expected activity group");
  expect(first.id).toBe("a1");
  expect(first.activities.map(item => item.id)).toEqual(["a1", "a2"]);
  expect(timeline.thought).toMatchObject({ id: "t2", text: "Current thought" });
  const afterCommentary = chatPresentation.buildChatWorkTimeline([...parts, { id: "c3", type: "commentary", text: "Reporting" }]);
  expect(afterCommentary.thought).toBeUndefined();
  expect(parts[1]!.id).toBe("a1");
});

test("only the current thought changes and publishing another event clears it without stopping activities", async () => {
  let writer!: ChatResponseWriter;
  const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
  chat.state.draft = "Go"; const task = chat.send();
  const activity = writer.activity({ label: "Still running" });
  const first = writer.thinking("First");
  writer.updateThinking(first, "Updated");
  const second = writer.thinking("Replacement");
  writer.updateThinking(first, "Stale update");
  let parts = chat.state.messages[1]!.parts;
  expect(parts.find(part => part.id === first)).toMatchObject({ text: "Updated", finishedAt: expect.any(Number) });
  expect(parts.filter(part => part.type === "thinking" && part.finishedAt === undefined)).toHaveLength(1);
  writer.commentary("Progress");
  writer.updateThinking(second, "Too late");
  parts = chat.state.messages[1]!.parts;
  expect(parts.find(part => part.id === second)).toMatchObject({ text: "Replacement", finishedAt: expect.any(Number) });
  expect(parts.find(part => part.id === activity)).toMatchObject({ status: "running" });
  expect(parts.filter(part => part.type === "thinking" && part.finishedAt === undefined)).toHaveLength(0);
  writer.complete(); await task;
});

test("explicit named activity groups accept selected activities across commentary without replacing automatic grouping", async () => {
  let writer!: ChatResponseWriter;
  const chat = createAIChat({ respond(_request, value) { writer = value; return new Promise(() => {}); } });
  chat.state.draft = "Go"; const task = chat.send();
  expect(writer.activityGroup).toBeFunction();
  const firstGroup = writer.activityGroup({ label: "Inspect project" });
  const secondGroup = writer.activityGroup({ label: "Run checks" });
  const first = writer.activity({ label: "Read files", groupId: firstGroup });
  writer.commentary("Checking results");
  writer.activity({ label: "Tests", groupId: secondGroup });
  const later = writer.activity({ label: "Read another file", groupId: firstGroup });
  writer.activity({ label: "Automatic action" });
  writer.updateActivity(first, { output: "Read complete" });
  const timeline = chatPresentation.buildChatWorkTimeline(chat.state.messages[1]!.parts);
  const groups = timeline.items.filter(item => item.type === "activityGroup");
  expect(groups.map(group => group.label)).toEqual(["Inspect project", "Run checks", undefined]);
  expect(groups[0]!.activities.map(activity => activity.id)).toEqual([first, later]);
  expect(groups[0]!.activities[0]!.output).toBe("Read complete");
  expect(() => writer.activity({ label: "Invalid", groupId: "missing" })).toThrow();
  expect(() => writer.activityGroup({ label: "   " })).toThrow();
  writer.complete(); await task;
  const snapshot = chat.fork(chat.state.messages[1]!.id);
  expect(snapshot[1]!.parts[0]).toMatchObject({ id: firstGroup, type: "activityGroup", label: "Inspect project" });
  chat.state.draft = "Another"; const next = chat.send();
  expect(() => writer.activity({ label: "Old group", groupId: firstGroup })).toThrow();
  chat.stop(); await next;
});

test("group elapsed time spans concurrent activities and freezes when all activities finish", () => {
  expect(chatPresentation.activityGroupTiming).toBeFunction();
  const activities = [
    { id: "a", type: "activity" as const, text: "", label: "A", output: "", startedAt: 1000, finishedAt: 4000, status: "completed" as const },
    { id: "b", type: "activity" as const, text: "", label: "B", output: "", startedAt: 2000, status: "running" as const },
  ];
  expect(chatPresentation.activityGroupTiming(activities, 62000)).toEqual({ running: true, duration: "1m 1s" });
  const finished = [activities[0]!, { ...activities[1]!, status: "completed" as const, finishedAt: 65000 }];
  expect(chatPresentation.activityGroupTiming(finished, 999000)).toEqual({ running: false, duration: "1m 4s" });
  expect(chatPresentation.activityGroupTiming([], 100)).toBeUndefined();
});
