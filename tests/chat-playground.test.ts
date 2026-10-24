import { expect, test } from "bun:test";
import { createChatPlayground } from "../packages/docs/src/examples/chatPlayground";
import { watch } from "vue";

test("manual responder stays open across messages and logs approval results", async () => {
  const session = createChatPlayground();
  session.chat.state.draft = "Create an icon";
  const task = session.chat.send();
  expect(session.state.request?.prompt).toBe("Create an icon");
  session.perform("Answer", writer => writer.message("First answer"));
  await Promise.resolve();
  expect(session.chat.state.busy).toBe(true);
  session.perform("Approval", writer => {
    const handle = writer.requestApproval({ text: "Save it?" });
    session.track("Approval result", handle);
    session.chat.resolveApproval(handle.id, "allow");
  });
  await Promise.resolve();
  expect(session.state.log.some(entry => entry.detail.includes('"decision":"allow"'))).toBe(true);
  expect(session.end()).toBe(true); await task;
  expect(session.state.request).toBeUndefined();
  expect(session.chat.state.messages[1]).toMatchObject({ status: "complete" });
  session.dispose();
});

test("manual completion reports pending input and stop prevents further writes", async () => {
  const session = createChatPlayground();
  session.chat.state.draft = "Go"; const task = session.chat.send();
  session.perform("Ask", writer => writer.askQuestions({ questions: [{ id: "q", text: "Name?", choices: [], allowCustom: true }] }));
  expect(session.end()).toBe(false);
  expect(session.state.feedback).toContain("pending");
  session.chat.stop(); await task;
  expect(session.state.request).toBeUndefined();
  expect(session.perform("Late", writer => writer.message("Late"))).toBe(false);
  expect(session.chat.state.messages[1]!.parts).toHaveLength(1);
  session.dispose();
});

test("reset preserves controller identity, aborts work and releases assets without cross-session state", async () => {
  const revoked: string[] = [];
  let sequence = 0;
  const session = createChatPlayground({ create: () => `blob:${++sequence}`, revoke: url => revoked.push(url) });
  const other = createChatPlayground();
  const chat = session.chat;
  chat.state.draft = "Image"; const task = chat.send();
  session.addFile(new File(["image"], "image.png", { type: "image/png" }));
  expect(chat.state.messages[1]!.parts[0]).toMatchObject({ type: "artifact", url: "blob:1" });
  expect(other.chat.state.messages).toEqual([]);
  session.reset(); await task;
  expect(session.chat).toBe(chat);
  expect(chat.state.messages).toEqual([]);
  expect(session.state.log).toEqual([]);
  expect(revoked).toEqual(["blob:1"]);
  expect(session.addFile(new File(["unused"], "unused.txt"))).toBe(false);
  chat.state.draft = "Again"; const next = chat.send();
  session.addFile(new File(["hello"], "hello.txt", { type: "text/plain" }));
  session.fail("Offline"); await next;
  expect(chat.state.messages[1]).toMatchObject({ status: "error", error: "Offline" });
  session.dispose(); session.dispose(); other.dispose();
  expect(revoked).toEqual(["blob:1", "blob:2"]);
  chat.state.draft = "Disposed"; expect(await chat.send()).toBe(false);
});

test("interactive demo cycles through seven examples and waits for chat decisions", async () => {
  const session = createChatPlayground({ create: file => `blob:${file.size}`, revoke() {} });
  expect(session.runExample).toBeFunction();
  session.state.demoDelayMs = 0;
  const seen = new Set<string>();
  const unwatch = watch(() => session.chat.state.messages.flatMap(message => message.parts).filter(part => (part.type === "approval" || part.type === "question") && part.status === "pending"), pending => {
    for (const part of pending) queueMicrotask(() => {
      if (part.type === "approval") session.chat.resolveApproval(part.id, "allow");
      if (part.type === "question") session.chat.answerQuestions(part.id, part.questions.map(question => ({ questionId: question.id, choiceIds: question.choices.length ? [question.choices[0]!.id] : [], ...(question.choices.length ? {} : { customText: "Custom answer" }) })));
    });
  }, { flush: "sync" });
  for (let index = 0; index < 7; index++) {
    await session.runExample();
    const last = session.chat.state.messages[session.chat.state.messages.length - 1]!;
    expect(last.status).toBe(index === 6 ? "error" : "complete");
    last.parts.forEach(part => seen.add(part.type));
  }
  expect(session.state.demoNext).toBe(7);
  expect([...seen].sort()).toEqual(["activity", "activityGroup", "approval", "artifact", "commentary", "message", "question", "thinking"]);
  expect(session.state.request).toBeUndefined();
  unwatch(); session.dispose();
});

test("stopping or resetting a demo cancels timers and cannot append to a later manual turn", async () => {
  const session = createChatPlayground();
  expect(session.runExample).toBeFunction();
  session.state.demoDelayMs = 10000;
  const demo = session.runExample();
  expect(session.chat.state.busy).toBe(true);
  session.reset(); await demo;
  expect(session.chat.state.messages).toEqual([]);
  expect(session.setMode("manual")).toBe(true);
  session.chat.state.draft = "Manual"; const manual = session.chat.send();
  await Promise.resolve();
  expect(session.chat.state.messages[1]!.parts).toEqual([]);
  session.perform("Answer", writer => writer.message("Manual answer"));
  session.end(); await manual;
  expect(session.chat.state.messages[1]!.parts).toHaveLength(1);
  session.dispose();
});

test("demo denial skips file delivery and stopping a pending request settles the turn", async () => {
  const session = createChatPlayground();
  session.state.demoDelayMs = 0;
  session.setScenario("approval");
  let stopInstead = false;
  const unwatch = watch(() => session.chat.state.messages.flatMap(message => message.parts).find(part => part.type === "approval" && part.status === "pending"), part => {
    if (part) queueMicrotask(() => { if (stopInstead) session.chat.stop(); else session.chat.resolveApproval(part.id, "deny"); });
  }, { flush: "sync" });
  await session.runExample();
  let last = session.chat.state.messages[session.chat.state.messages.length - 1]!;
  expect(last.status).toBe("complete");
  expect(last.parts.some(part => part.type === "artifact")).toBe(false);
  expect(last.parts.find(part => part.type === "approval")).toMatchObject({ decision: "deny" });
  stopInstead = true;
  await session.runExample();
  last = session.chat.state.messages[session.chat.state.messages.length - 1]!;
  expect(last.status).toBe("stopped");
  expect(last.parts.find(part => part.type === "approval")).toMatchObject({ status: "cancelled" });
  expect(session.state.request).toBeUndefined();
  unwatch(); session.dispose();
});

test("demo reports the attachment limit instead of claiming new files were delivered", async () => {
  let count = 0;
  const session = createChatPlayground({ create: () => `blob:${++count}`, revoke() {} });
  session.chat.state.draft = "Fill attachments";
  const manual = session.chat.send();
  for (let index = 0; index < 20; index++) session.addFile(new File(["x"], `${index}.txt`));
  session.end(); await manual;
  session.state.demoDelayMs = 0; session.setScenario("artifacts");
  await session.runExample();
  const last = session.chat.state.messages[session.chat.state.messages.length - 1]!;
  expect(last.parts.some(part => part.type === "artifact")).toBe(false);
  expect(last.parts.filter(part => part.type === "message").map(part => part.text).join("")).toContain("attachment limit");
  session.dispose();
});
