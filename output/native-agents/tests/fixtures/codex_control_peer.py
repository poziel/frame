"""Offline Codex peer for cancellation timing and exact permission scope."""
import json
import sys
import time
scenario = sys.argv[1]
count = 0

def out(value):
    print(json.dumps(value), flush=True)

def finish(status="completed"):
    out({"method":"turn/completed","params":{"threadId":"s","turnId":f"turn-{count}","turn":{"id":f"turn-{count}","status":status}}})

requested={"fileSystem":{"write":["/work/allowed"]},"network":{"enabled":False}}
for line in sys.stdin:
    request=json.loads(line)
    method=request.get("method")
    if method=="initialize":
        out({"id":request["id"],"result":{}})
    elif method=="initialized":
        pass
    elif method=="thread/start":
        out({"id":request["id"],"result":{"thread":{"id":"s"}}})
    elif method=="turn/start":
        count+=1
        if scenario=="early" and count==1:
            out({"method":"test/turnStarting","params":{}})
            time.sleep(0.2)
        out({"id":request["id"],"result":{"turn":{"id":f"turn-{count}"}}})
        if scenario=="early":
            if count>1:
                finish()
        else:
            out({"id":900,"method":"item/permissions/requestApproval","params":{"threadId":"s","turnId":f"turn-{count}","permissions":requested}})
    elif method=="turn/interrupt":
        assert scenario=="early" and count==1, request
        assert request["params"]=={"threadId":"s","turnId":"turn-1"}, request
        out({"id":request["id"],"result":{}})
        finish("interrupted")
    elif method is None:
        expected=requested if scenario=="allow" else {}
        assert request["id"]==900 and request["result"]=={"permissions":expected,"scope":"turn"}, request
        finish()
    else:
        raise AssertionError(request)

