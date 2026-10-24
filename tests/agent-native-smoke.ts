import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createAgentChatSession, createJsonLineAgentConnection } from '../packages/features/src/agentChat';

const folder = await mkdtemp(join(tmpdir(), 'frame-agent-smoke-'));
const native = process.env.FRAME_AGENT_SERVER ?? resolve('../frame-native/agents/target/debug/frame-agent-server.exe');
const config = join(folder, 'config.json');
await writeFile(config, JSON.stringify({ applicationId: 'smoke', allowedRoots: [process.cwd()], connectors: { claude: { python: 'python', helper: resolve('tests/fixtures/agent/helper.py') } } }));
const child = Bun.spawn([native, '--config', config], { stdin: 'pipe', stdout: 'pipe', stderr: 'inherit' });
const listeners = new Set<(chunk: string) => void>();
const reading = (async () => {
  const decoder = new TextDecoder();
  for await (const chunk of child.stdout) {
    const text = decoder.decode(chunk, { stream: true });
    for (const listener of [...listeners]) listener(text);
  }
})();
const connection = createJsonLineAgentConnection({
  write(line) { child.stdin.write(line); child.stdin.flush(); },
  subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
});
try {
  const agent = await createAgentChatSession(connection, { provider: 'claude', applicationId: 'smoke', cwd: process.cwd() });
  agent.chat.state.draft = 'Offline prompt';
  await agent.chat.send();
  const answer = agent.chat.state.messages.at(-1);
  if (answer?.status !== 'complete' || !answer.parts.some(part => part.type === 'message' && part.text === 'Offline integration passed' && part.phase === 'final')) throw new Error('Native service did not map its final snapshot into the chat');
  await agent.dispose();
  await connection.request('shutdown', {});
  await child.exited;
  if (child.exitCode !== 0) throw new Error(`Service exited ${child.exitCode}`);
  console.log('Features → JSONL service → Python peer → Features smoke passed (no inference).');
} finally {
  connection.dispose();
  child.stdin.end();
  child.kill();
  await reading;
  await rm(folder, { recursive: true, force: true });
}
