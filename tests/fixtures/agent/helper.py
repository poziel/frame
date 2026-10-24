"""Offline Claude-helper peer for the full native-service / Features smoke."""
import json
import sys
active = None
def out(value):
    print(json.dumps(value), flush=True)
def reply(request, value=None):
    out({'id': request['id'], 'result': value})
for line in sys.stdin:
    request = json.loads(line)
    method = request['method']
    params = request.get('params') or {}
    if method == 'initialize':
        reply(request, {})
    elif method == 'session/create':
        reply(request, {'id': 'offline-session', 'title': 'Smoke', 'cwd': params['cwd']})
    elif method == 'turn/send':
        active = request
        envelope = {'sessionId': params['sessionId'], 'turnId': params['turnId']}
        out({'method': 'event', 'params': {**envelope, 'type': 'message', 'id': 'answer', 'text': 'Draft', 'phase': 'intermediate', 'delta': True}})
        out({'method': 'event', 'params': {**envelope, 'type': 'message', 'id': 'answer', 'text': 'Offline integration passed', 'phase': 'final', 'delta': False}})
        out({'method': 'event', 'params': {**envelope, 'type': 'completed', 'status': 'complete'}})
        reply(request)
    elif method == 'shutdown':
        reply(request)
        break
    else:
        reply(request)
