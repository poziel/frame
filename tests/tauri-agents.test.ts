import {describe, expect, test} from 'bun:test';
import {TauriAgentConnection} from '../packages/tauri/src/agents';

describe('Tauri agent connection', () => {
  test('routes requests and events, and disconnects once', async () => {
    const calls: unknown[] = [];
    const connection = new TauriAgentConnection(
      'owned-runtime',
      async (command, args) => {
        calls.push([command, args]);
        return {ok: true} as never;
      }
    );
    const events: unknown[] = [];
    const stop = connection.subscribe((event) => events.push(event));
    const event = {sessionId: 'session', event: {type: 'test'}} as never;
    connection.receive(event);
    expect(events).toEqual([event]);
    stop();
    connection.receive(event);
    expect(events).toHaveLength(1);
    expect(
      await connection.request('models/list', {sessionId: 'session'})
    ).toEqual({ok: true});
    await Promise.all([connection.dispose(), connection.dispose()]);
    expect(calls).toEqual([
      [
        'plugin:frame-agent-connectors|request',
        {
          runtimeId: 'owned-runtime',
          method: 'models/list',
          params: {sessionId: 'session'},
        },
      ],
      [
        'plugin:frame-agent-connectors|disconnect',
        {runtimeId: 'owned-runtime'},
      ],
    ]);
    await expect(connection.request('session/create')).rejects.toThrow(
      'disposed'
    );
    connection.receive(event);
    expect(events).toHaveLength(1);
  });

  test('keeps disconnect failures observable without resending', async () => {
    let calls = 0;
    const connection = new TauriAgentConnection('runtime', async () => {
      calls++;
      throw new Error('native disconnect failed');
    });
    await expect(connection.dispose()).rejects.toThrow(
      'native disconnect failed'
    );
    await expect(connection.dispose()).rejects.toThrow(
      'native disconnect failed'
    );
    expect(calls).toBe(1);
  });
});
