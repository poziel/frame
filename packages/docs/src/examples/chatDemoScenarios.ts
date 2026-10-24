import type { ChatResponseWriter } from "@frame/features";

export const chatDemoScenarios = [
  {
    id: "tour",
    label: "Full interactive tour",
    prompt: "Create a small icon and walk me through your work.",
  },
  {
    id: "reply",
    label: "Quick streamed answer",
    prompt: "Give me a small idea for a creative project.",
  },
  {
    id: "groups",
    label: "Grouped investigation",
    prompt: "Inspect a project and show me the checks you run.",
  },
  {
    id: "approval",
    label: "Approval and decision",
    prompt: "Prepare an export and ask before delivering it.",
  },
  {
    id: "choices",
    label: "Choices and custom answers",
    prompt: "Help me choose a style and export formats.",
  },
  {
    id: "artifacts",
    label: "Image and document delivery",
    prompt: "Show me a sample image and give me the notes.",
  },
  {
    id: "failure",
    label: "Simulated failure",
    prompt: "Show me how a failed operation is displayed.",
  },
] as const;
export type ChatDemoScenarioId = (typeof chatDemoScenarios)[number]["id"];

interface DemoContext {
  writer: ChatResponseWriter;
  signal: AbortSignal;
  scenario: ChatDemoScenarioId;
  delayMs: number;
  prompt: string;
  deliver: (file: File) => boolean;
  record: (label: string, detail?: unknown) => void;
  feedback: (text: string) => void;
}

/** Every delay is owned by the current demo turn and cancelled on stop/reset/disposal. */
function pause(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Demo stopped", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(new DOMException("Demo stopped", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export async function runChatDemo(context: DemoContext) {
  const { writer, signal, scenario, record, feedback } = context;
  const wait = () =>
    pause(Math.max(0, Math.min(2000, context.delayMs)), signal);
  const thought = async () => {
    const id = writer.thinking("Considering a useful next step…");
    await wait();
    writer.updateThinking(id, "Comparing a couple of approaches…");
    await wait();
  };
  const stream = async (text: string) => {
    const id = writer.message("");
    for (const chunk of text.match(/.{1,36}(?:\s|$)|.{1,36}/g) ?? [text]) {
      await wait();
      writer.append(id, chunk);
    }
  };
  const deliver = () => {
    // A tiny deterministic pixel image keeps the demo independent of any network or AI service.
    const validPng =
      "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAYklEQVR4nGOQkFH5T0vMMGoBVS0w2PAAjGliAcxwUi1hIMdwUixhINdwYi1hoMRwYixhoNRwQpYwUMNwfJYwUMtwXJbQ3wKaBxFdIpkuyZQuGY2QJUOnsEO3ZOhWOBIj0gIAy93ObnSmJ28AAAAASUVORK5CYII=";
    const image = context.deliver(
      new File(
        [
          Uint8Array.from(atob(validPng), (character) =>
            character.charCodeAt(0),
          ),
        ],
        "demo-icon.png",
        { type: "image/png" },
      ),
    );
    const notes = context.deliver(
      new File(
        [
          `Demo export notes\n\nPrompt: ${context.prompt}\n\nThis preview was generated locally by the documentation playground. No AI service or project files were used.\n`,
        ],
        "demo-notes.txt",
        { type: "text/plain" },
      ),
    );
    record(
      image && notes
        ? "Demo artifacts delivered"
        : "Demo attachment limit reached",
    );
    return image && notes;
  };
  const approval = async () => {
    feedback("Demo waiting: allow, deny or cancel the request in the chat.");
    const request = writer.requestApproval({
      text: "Deliver the simulated export?",
      detail:
        "Demo only: creates a downloadable image and notes in memory. No project files are changed.",
    });
    record("Demo approval requested", { partId: request.id });
    const result = await request.result;
    if (signal.aborted) throw new DOMException("Demo stopped", "AbortError");
    record("Demo approval result", result);
    feedback("Demo continuing after your decision.");
    return result.status === "answered" && result.decision === "allow";
  };
  const question = async () => {
    feedback(
      "Demo waiting: choose options or write your own answer in the chat.",
    );
    const request = writer.askQuestions({
      text: "A couple of preferences",
      questions: [
        {
          id: "style",
          text: "Which style should I explore?",
          choices: [
            { id: "pixel", label: "Pixel art" },
            { id: "minimal", label: "Minimal" },
          ],
          allowCustom: true,
        },
        {
          id: "formats",
          text: "Which formats do you need?",
          choices: [
            { id: "png", label: "PNG" },
            { id: "gif", label: "GIF" },
          ],
          multiple: true,
          allowCustom: true,
        },
      ],
    });
    record("Demo questions requested", { partId: request.id });
    const result = await request.result;
    if (signal.aborted) throw new DOMException("Demo stopped", "AbortError");
    record("Demo answers", result);
    feedback("Demo continuing after your answer.");
    return result.status === "answered"
      ? result.answers
          .map((answer) =>
            [...answer.choiceIds, answer.customText].filter(Boolean).join(", "),
          )
          .join("; ")
      : "No preference submitted";
  };

  await wait();
  if (scenario === "reply") {
    await thought();
    await stream(
      "Try a tiny illustrated weather journal. Start with one icon and one sentence for today, then add a new page tomorrow.",
    );
    return;
  }
  writer.commentary(
    `I’ll demonstrate this locally for your request: “${context.prompt.slice(0, 160)}”`,
  );
  await wait();
  await thought();
  if (scenario === "choices") {
    const answer = await question();
    await wait();
    await stream(
      `Your preferences are recorded: ${answer}. This is a scripted example showing how an agent can continue after your response.`,
    );
    return;
  }
  if (scenario === "approval") {
    writer.commentary("The sample export is ready for your decision.");
    await wait();
    const allowed = await approval();
    await wait();
    const delivered = allowed && deliver();
    await stream(
      delivered
        ? "Approved. Your demo image and notes are attached below."
        : allowed
          ? "Approved, but the session attachment limit was reached. Reset the session to release its demo files and try again."
          : "Export was not approved. No demo files were delivered; you can send another prompt to try a different example.",
    );
    return;
  }
  const group = writer.activityGroup({ label: "Inspect the project" });
  const read = writer.activity({
    label: "Read project files",
    groupId: group,
    text: "Inspecting a simulated local project.",
    output: "Reading palette.json…",
  });
  await wait();
  writer.updateActivity(read, {
    output: "Read palette.json\nFound 8 colors\nRead icon.config.json",
  });
  const check = writer.activity({
    label: "Validate configuration",
    groupId: group,
    output: "Checking dimensions…",
  });
  await wait();
  writer.finishActivity(read);
  if (scenario === "failure") {
    writer.updateActivity(check, {
      output: "Configuration check failed: simulated connection lost.",
    });
    writer.finishActivity(check, "failed");
    await wait();
    writer.fail(
      "Simulated connection lost. Send another prompt or reset the playground to continue.",
    );
    return;
  }
  writer.commentary(
    "The files are readable. I’m checking the result while the last validation finishes.",
  );
  const second = writer.activityGroup({ label: "Prepare the result" });
  const prepare = writer.activity({
    label: "Build preview",
    groupId: second,
    output: "Preparing preview…",
  });
  await wait();
  writer.updateActivity(check, {
    output: "Dimensions valid\nAll checks passed",
  });
  writer.finishActivity(check);
  writer.updateActivity(prepare, { output: "Preview prepared successfully" });
  writer.finishActivity(prepare);
  record("Demo activities completed");
  if (scenario === "tour") {
    const preferences = await question();
    writer.commentary(
      `Preferences received: ${preferences}. The demo preview is ready.`,
    );
    await wait();
    const allowed = await approval();
    await wait();
    const delivered = allowed && deliver();
    await stream(
      delivered
        ? "The interactive tour is complete. You saw live thoughts, commentary, grouped actions, questions, an approval, streamed text and attached files."
        : allowed
          ? "The interactive tour is complete. The attachment limit was reached; reset the session before requesting more demo files."
          : "The interactive tour is complete. Your decision was respected and no files were delivered. Send another prompt to see the next example.",
    );
  } else if (scenario === "artifacts") {
    const delivered = deliver();
    await stream(
      delivered
        ? "Here is a small pixel preview and a downloadable notes file. Both were created in memory by this demo."
        : "The session attachment limit was reached. Reset the session to release its demo files, then try this example again.",
    );
  } else {
    await thought();
    await stream(
      "The simulated investigation is complete. Both activity groups are available in the work history, including output from the earlier validation.",
    );
  }
}
