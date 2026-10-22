import type { Plugin, ViteDevServer } from "vite";

/** Local demonstration only. No AI service or credentials. NDJSON events preserve part order. */
export function chatDemoServer(): Plugin {
  const install = (server: Pick<ViteDevServer, "middlewares">) => {
    server.middlewares.use("/api/chat-demo", (request, response) => {
      if (request.method !== "POST") { response.writeHead(405); response.end(); return; }
      let size = 0;
      request.on("data", (chunk: Buffer) => { size += chunk.length; if (size > 64 * 1024) request.destroy(); });
      request.on("end", () => {
        response.writeHead(200, { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" });
        const sentences = ["A tiny idea can become something useful with a little room to grow.", "The best next step is the one you can try and learn from.", "There is always another way to look at the same problem.", "A quiet workspace makes room for a surprisingly good idea."];
        const write = (event: object) => response.write(JSON.stringify(event) + "\n");
        write({ type: "thinking", id: "first", text: "Reading your message and considering a few possible replies. This is simulated thinking for the component demo." });
        const timers = [
          setTimeout(() => write({ type: "update-thinking", id: "first", text: "Reading your message and considering a few possible replies.\nChoosing a random sentence from the local demo server." }), 1500),
          setTimeout(() => { write({ type: "finish-thinking", id: "first" }); write({ type: "message", text: sentences[Math.floor(Math.random() * sentences.length)] }); }, 3500),
          setTimeout(() => write({ type: "message", text: "This is a second message in the same response. You can copy it, forge a conversation, or rewind your prompt to try again." }), 4000),
          setTimeout(() => { write({ type: "complete" }); response.end(); }, 4400),
        ];
        response.on("close", () => timers.forEach(clearTimeout));
      });
    });
  };
  return { name: "frame-chat-demo", configureServer: install, configurePreviewServer: install };
}
