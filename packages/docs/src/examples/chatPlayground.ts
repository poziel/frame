import { shallowReactive } from "vue";
import {
  createAIChat,
  type ChatInteractionHandle,
  type ChatMessage,
  type ChatRequest,
  type ChatResponseWriter,
} from "@frame/features";
import {
  chatDemoScenarios,
  runChatDemo,
  type ChatDemoScenarioId,
} from "./chatDemoScenarios";

interface AssetUrls {
  create: (file: Blob) => string;
  revoke: (url: string) => void;
}
export interface PlaygroundLogEntry {
  id: string;
  time: number;
  label: string;
  detail: string;
}
/** Docs-only manual adapter. All chat writes use the public Features contract. */
export function createChatPlayground(
  urls: AssetUrls = {
    create: (file) => URL.createObjectURL(file),
    revoke: (url) => URL.revokeObjectURL(url),
  },
) {
  const state = shallowReactive({
    request: undefined as ChatRequest | undefined,
    log: [] as PlaygroundLogEntry[],
    feedback: "Send a message in the sidebar to begin.",
    mode: "manual" as "manual" | "demo",
    demoScenario: "cycle" as ChatDemoScenarioId | "cycle",
    demoNext: 0,
    demoDelayMs: 600,
    activeDemo: undefined as ChatDemoScenarioId | undefined,
  });
  let writer: ChatResponseWriter | undefined;
  let release: (() => void) | undefined;
  let generation = 0;
  let disposed = false;
  const assets = new Set<string>();
  function record(label: string, detail: unknown = "") {
    state.log = [
      ...state.log.slice(-199),
      {
        id: crypto.randomUUID(),
        time: Date.now(),
        label,
        detail: typeof detail === "string" ? detail : JSON.stringify(detail),
      },
    ];
  }
  const chat = createAIChat({
    respond(request, response) {
      state.request = request;
      writer = response;
      state.feedback = "Turn active. Send events from the workspace.";
      record("User prompt", {
        prompt: request.prompt,
        attachments: request.attachments.map((item) => item.name),
      });
      return new Promise<void>((resolve) => {
        const demo = new AbortController();
        const finish = () => {
          demo.abort();
          request.signal.removeEventListener("abort", finish);
          if (writer === response) {
            if (state.activeDemo && request.signal.aborted) {
              const last = chat.state.messages[chat.state.messages.length - 1];
              record(
                last?.status === "error" ? "Demo failed" : "Demo stopped",
                last?.error ?? "",
              );
              state.feedback =
                last?.status === "error"
                  ? "The demo failed as requested. Send another prompt to continue."
                  : "Demo stopped. Send another prompt or switch to manual mode.";
            }
            writer = undefined;
            release = undefined;
            state.request = undefined;
            state.activeDemo = undefined;
          }
          resolve();
        };
        release = finish;
        request.signal.addEventListener("abort", finish, { once: true });
        if (state.mode === "demo") {
          const selected =
            state.demoScenario === "cycle"
              ? chatDemoScenarios[state.demoNext % chatDemoScenarios.length]!
              : chatDemoScenarios.find(
                  (scenario) => scenario.id === state.demoScenario,
                )!;
          state.demoNext++;
          state.activeDemo = selected.id;
          state.feedback = `Demo running: ${selected.label}. Respond to requests in the chat.`;
          record("Demo started", selected.label);
          const current = () =>
            writer === response && !demo.signal.aborted && !disposed;
          void runChatDemo({
            writer: response,
            signal: demo.signal,
            scenario: selected.id,
            delayMs: state.demoDelayMs,
            prompt: request.prompt,
            deliver(file) {
              return current() && addFile(file);
            },
            record(label, detail) {
              if (current()) record(label, detail);
            },
            feedback(text) {
              if (current()) state.feedback = text;
            },
          }).then(
            () => {
              if (current() && chat.state.busy) end();
            },
            (error) => {
              if (current() && chat.state.busy)
                fail(error instanceof Error ? error.message : "Demo failed.");
            },
          );
        }
      });
    },
  });
  function perform(
    label: string,
    action: (writer: ChatResponseWriter) => unknown,
  ) {
    if (!writer || !chat.state.busy || disposed) {
      state.feedback = "Send a message in the sidebar to begin a turn.";
      return false;
    }
    try {
      const result = action(writer);
      record(label, typeof result === "string" ? { partId: result } : "Sent");
      state.feedback = `${label} sent.`;
      return true;
    } catch (error) {
      state.feedback =
        error instanceof Error ? error.message : "Unable to send event.";
      return false;
    }
  }
  function track<T>(label: string, handle: ChatInteractionHandle<T>) {
    const epoch = generation;
    record(label.replace(/ result$/, " requested"), { partId: handle.id });
    void handle.result.then((result) => {
      if (epoch === generation && !disposed)
        record(label, { partId: handle.id, result });
    });
  }
  function end() {
    if (!writer || disposed) return false;
    const wasDemo = state.activeDemo !== undefined;
    if (!writer.complete()) {
      state.feedback =
        "Resolve or cancel pending requests in the chat before ending the turn.";
      return false;
    }
    record("Turn completed");
    release?.();
    state.feedback = wasDemo
      ? "Demo completed. Send another prompt for the next example, or choose a demo above."
      : "Turn completed. Send another prompt to continue.";
    return true;
  }
  function fail(message: string) {
    if (!writer || disposed) return false;
    writer.fail(message || "Simulated agent failure.");
    record("Turn failed", message);
    release?.();
    state.feedback = "Simulated failure sent.";
    return true;
  }
  function stop() {
    const wasBusy = chat.state.busy;
    chat.stop();
    if (wasBusy) record("Turn stopped");
    state.feedback = "Turn stopped.";
  }
  function addFile(file: File) {
    if (!writer || !chat.state.busy || disposed) return false;
    if (file.size > 20 * 1024 * 1024 || assets.size >= 20) {
      state.feedback = "Use files up to 20 MB; reset after 20 attachments.";
      return false;
    }
    const url = urls.create(file);
    assets.add(url);
    const image = /^image\/(png|jpeg|gif|webp|avif)$/.test(file.type);
    return perform("Artifact", (writer) =>
      writer.artifact({
        name: file.name,
        url,
        kind: image ? "image" : "file",
        mimeType: file.type,
        size: file.size,
      }),
    );
  }
  function releaseAssets() {
    for (const url of assets) urls.revoke(url);
    assets.clear();
  }
  function reset() {
    if (disposed) return;
    generation++;
    chat.clear();
    release?.();
    releaseAssets();
    state.log = [];
    state.demoNext = 0;
    state.feedback = "Session reset. Send a message in the sidebar to begin.";
  }
  function forge(messages: ChatMessage[]) {
    generation++;
    chat.clear();
    release?.();
    chat.state.messages = messages;
    record("Conversation forged", { messages: messages.length });
    state.feedback =
      "Conversation forged. Send a prompt to continue from this point.";
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    generation++;
    chat.dispose();
    release?.();
    releaseAssets();
    state.log = [];
  }
  function setMode(mode: string) {
    if (disposed || chat.state.busy || (mode !== "manual" && mode !== "demo"))
      return false;
    state.mode = mode;
    state.feedback =
      mode === "demo"
        ? "Interactive demo ready. Send a prompt or run an example."
        : "Manual mode ready. Send a prompt, then use the workspace controls.";
    return true;
  }
  function setScenario(scenario: string) {
    if (
      disposed ||
      chat.state.busy ||
      (scenario !== "cycle" &&
        !chatDemoScenarios.some((item) => item.id === scenario))
    )
      return false;
    state.demoScenario = scenario as ChatDemoScenarioId | "cycle";
    return true;
  }
  function runExample() {
    if (!setMode("demo")) return Promise.resolve(false);
    const selected =
      state.demoScenario === "cycle"
        ? chatDemoScenarios[state.demoNext % chatDemoScenarios.length]!
        : chatDemoScenarios.find((item) => item.id === state.demoScenario)!;
    if (!chat.state.draft.trim()) chat.state.draft = selected.prompt;
    return chat.send();
  }
  return {
    chat,
    state,
    perform,
    track,
    end,
    fail,
    stop,
    addFile,
    reset,
    forge,
    dispose,
    setMode,
    setScenario,
    runExample,
  };
}
export type ChatPlayground = ReturnType<typeof createChatPlayground>;
