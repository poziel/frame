import { createAIChat } from "./aiChat";
import type { AgentChatOptions, AgentConnection, AgentEventEnvelope, AgentLineConnectionOptions, AgentLineTransport, AgentSession } from "./agentTypes";

/** Adapts an existing host transport. Never starts or owns a native process. */
export function createJsonLineAgentConnection(transport: AgentLineTransport, options: AgentLineConnectionOptions = {}) {
  const listeners = new Set<(event: AgentEventEnvelope) => void>();
  const pending = new Map<string, {resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout>}>();
  let buffer = "", nextId = 0, closed: Error | undefined;
  let unsubscribe = () => {};
  const limit = options.maxBufferLength ?? 16 * 1024 * 1024;
  const timeout = options.timeoutMs ?? 30_000;
  const turnTimeout = options.turnTimeoutMs ?? 3_600_000;
  if (!Number.isFinite(limit) || limit < 1 || !Number.isFinite(timeout) || timeout < 1 || !Number.isFinite(turnTimeout) || turnTimeout < 1) throw new Error("Agent framing limits must be positive.");
  function dispose(reason = new Error("Agent connection disposed")) {
    if (closed) return; closed = reason; unsubscribe(); buffer = "";
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(reason); }
    pending.clear(); listeners.clear();
  }
  unsubscribe = transport.subscribe(chunk => {
    if (closed) return;
    buffer += chunk;
    while (buffer.includes("\n")) {
      const newline = buffer.indexOf("\n");
      if (newline > limit) { dispose(new Error("Agent JSONL frame exceeds configured limit")); return; }
      const line = buffer.slice(0,newline).trim(); buffer = buffer.slice(newline+1);
      if (!line) continue;
      let value: Record<string, unknown>;
      try { value = JSON.parse(line); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); }
      catch { dispose(new Error("Invalid agent JSONL frame")); return; }
      if (value.method === "event") {
        const event = value.params as AgentEventEnvelope | undefined;
        if (!event || typeof event.sessionId !== "string" || typeof event.turnId !== "string" || typeof event.type !== "string") { dispose(new Error("Invalid agent event envelope")); return; }
        for (const listener of [...listeners]) { try { listener(event); } catch { /* Each subscriber owns its failure handling. */ } }
      } else if (value.id !== undefined) {
        const key = String(value.id), item = pending.get(key);
        if (!item) continue;
        pending.delete(key); clearTimeout(item.timer);
        if (value.error !== undefined) { const error = value.error as {message?: unknown}; item.reject(new Error(typeof error?.message === "string" ? error.message : "Agent request failed")); }
        else item.resolve(value.result);
      }
    }
    if (buffer.length > limit) dispose(new Error("Agent JSONL frame exceeds configured limit"));
  });
  return {
    request<T>(method: string, params: unknown): Promise<T> {
      if (closed) return Promise.reject(closed);
      const id = ++nextId;
      return new Promise<T>((resolve,reject) => {
        const key = String(id);
        const timer = setTimeout(() => { pending.delete(key); reject(new Error(`Agent request timed out: ${method}`)); }, method === "turn/send" ? turnTimeout : timeout);
        pending.set(key,{resolve: value => resolve(value as T),reject,timer});
        try { const line = JSON.stringify({jsonrpc:"2.0",id,method,params}) + "\n"; void Promise.resolve(transport.write(line)).catch(error => { const item = pending.get(key); if (item) { pending.delete(key); clearTimeout(item.timer); item.reject(error instanceof Error ? error : new Error(String(error))); } }); }
        catch (error) { pending.delete(key); clearTimeout(timer); reject(error); }
      });
    },
    subscribe(listener: (event: AgentEventEnvelope) => void) { if (closed) throw closed; listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose,
  };
}

/** Creates one native session with an embeddable chat controller and no shell registration.
 * Native conversations cannot be cleared or rewound locally: those chat methods throw before mutation.
 * Dispose and create another session to start a different conversation.
 */
export async function createAgentChatSession(connection: AgentConnection, options: AgentChatOptions) {
  const { resolveArtifact, onMetadata, ...sessionOptions } = options;
  const session = await connection.request<AgentSession>("session/create", sessionOptions);
  let disposed = false;
  const chat = createAIChat({ respond(request,writer) {
    if (request.attachments.length) throw new Error("Native agent attachments require host integration; this connection currently accepts text prompts only.");
    const turnId = crypto.randomUUID();
    return new Promise<void>((resolve,reject) => {
      let accepting = true, finished = false;
      let unsubscribe = () => {};
      const messages = new Map<string,string>(), thoughts = new Map<string,{id:string;text:string}>(), activities = new Map<string,string>();
      const interactions = new Map<string,string>();
      const jobs = new Set<Promise<void>>();
      function cleanup() { unsubscribe(); request.signal.removeEventListener("abort",abort); }
      function fail(error: unknown) { if (finished) return; const cancel = accepting; accepting = false; finished = true; cleanup(); if (cancel) void connection.request("turn/cancel",{sessionId:session.sessionId,turnId}).catch(() => {}); reject(error instanceof Error ? error : new Error(String(error))); }
      function abort() { if (finished) return; accepting = false; finished = true; cleanup(); void connection.request("turn/cancel",{sessionId:session.sessionId,turnId}).catch(() => {}); resolve(); }
      function track(job: Promise<void>) { jobs.add(job); void job.catch(fail).finally(() => jobs.delete(job)); }
      function reply(requestId: string, result: Promise<unknown>) {
        track(result.then(async response => { if (!accepting || disposed || request.signal.aborted) return; await connection.request("interaction/respond",{sessionId:session.sessionId,turnId,requestId,response}); }));
      }
      function artifact(event: Extract<AgentEventEnvelope,{type:"artifact"}>) {
        if (resolveArtifact) track(resolveArtifact(event).then(result => { if (!finished && !request.signal.aborted && result) writer.artifact(result); }));
        else if (event.url && /^(https?:|blob:|data:)/i.test(event.url)) writer.artifact({name:event.name,url:event.url,kind:event.mimeType?.startsWith("image/") ? "image" : "file",mimeType:event.mimeType ?? undefined});
        else onMetadata?.(event);
      }
      function receive(event: AgentEventEnvelope) {
        if (!accepting || event.sessionId !== session.sessionId || event.turnId !== turnId) return;
        try { switch(event.type) {
          case "message": { const id = messages.get(event.id); if (!id) messages.set(event.id,writer.message(event.text,{phase:event.phase})); else if (event.delta) writer.append(id,event.text); else writer.updateMessage(id,event.text,{phase:event.phase}); break; }
          case "thinking": { let thought = thoughts.get(event.id); if (!thought) { thought = {id:writer.thinking(event.text),text:event.text}; thoughts.set(event.id,thought); } else { thought.text = event.delta ? thought.text + event.text : event.text; writer.updateThinking(thought.id,thought.text); } if (event.finished) writer.finishThinking(thought.id); break; }
          case "activity": { let id = activities.get(event.id); if (!id) { id = writer.activity({label:event.label,text:event.text,output:event.output}); activities.set(event.id,id); } else writer.updateActivity(id,{label:event.label,text:event.text,output:event.output}); if (event.status === "completed" || event.status === "failed") writer.finishActivity(id,event.status); break; }
          case "approval": { if (interactions.has(event.requestId)) break; const handle = writer.requestApproval({text:event.text,detail:event.detail ?? undefined}); interactions.set(event.requestId,handle.id); reply(event.requestId,handle.result.then(result => result.status === "answered" ? {type:"approval",decision:result.decision} : {type:"cancel"})); break; }
          case "questions": { if (interactions.has(event.requestId)) break; const handle = writer.askQuestions({text:event.text,questions:event.questions}); interactions.set(event.requestId,handle.id); reply(event.requestId,handle.result.then(result => result.status === "answered" ? {type:"answers",answers:result.answers} : {type:"cancel"})); break; }
          case "artifact": artifact(event); break;
          case "completed": {
            accepting = false; cleanup();
            for (const id of interactions.values()) chat.cancelInteraction(id);
            if (event.error || ["error","failed"].includes(event.status)) { fail(event.error ?? "Agent turn failed"); break; }
            if (["cancelled","canceled","stopped"].includes(event.status)) { finished = true; chat.stop(); resolve(); break; }
            void Promise.all([...jobs]).then(() => { if (finished) return; finished = true; writer.complete(); resolve(); },fail); break;
          }
          default: onMetadata?.(event);
        }} catch(error) { fail(error); }
      }
      try {
        unsubscribe = connection.subscribe(receive);
        request.signal.addEventListener("abort",abort,{once:true});
        if (request.signal.aborted || disposed) { abort(); return; }
        void connection.request("turn/send",{sessionId:session.sessionId,turnId,text:request.prompt}).catch(error => { if (accepting) fail(error); });
      } catch(error) { fail(error); }
    });
  }});
  // These native APIs carry their own conversation history. Local history edits
  // cannot rewind that history consistently across the five providers.
  const send = chat.send;
  let history = JSON.stringify(chat.state.messages);
  let historyChanged = false;
  chat.clear = () => { throw new Error("Clearing a native session's history is unsupported. Dispose this session and create a new agent chat."); };
  chat.rewind = () => { throw new Error("Rewinding a native session's history is unsupported. Create a new agent chat for a different conversation."); };
  chat.send = async () => {
    if (chat.state.busy || disposed) return false;
    if (chat.state.rewindId || historyChanged || JSON.stringify(chat.state.messages) !== history) throw new Error("Local chat history differs from the native session. Dispose this session and create a new agent chat.");
    const count = chat.state.messages.length;
    const previous = history;
    try { return await send(); }
    finally {
      if (JSON.stringify(chat.state.messages.slice(0,count)) !== previous) historyChanged = true;
      history = JSON.stringify(chat.state.messages);
    }
  };
  return {chat,session, async dispose() { if (disposed) return; disposed = true; chat.dispose(); await connection.request("session/close",{sessionId:session.sessionId}); }};
}





