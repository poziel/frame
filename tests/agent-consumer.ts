import { createAgentChatSession, createJsonLineAgentConnection, type AgentConnection, type AgentProvider, type AgentLineTransport, type AgentEventEnvelope } from '@frame/core/modules/chat';
const provider: AgentProvider = 'claude';
const transport: AgentLineTransport = { write(_line) {}, subscribe(_listener) { return () => {}; } };
const connection: AgentConnection = createJsonLineAgentConnection(transport);
const create = () => createAgentChatSession(connection, { provider, applicationId: 'pixloom', cwd: '.', onMetadata(
  event: AgentEventEnvelope
) { void event.type; } });
void create;
// @ts-expect-error Providers have stable identifiers rather than arbitrary model names.
const invalid: AgentProvider = 'unknown';
void invalid;
