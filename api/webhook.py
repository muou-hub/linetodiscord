from flask import Request
import requests

def handler(request: Request):
    if request.method != "POST":
        return ("Only POST allowed", 405)

    try:
        body = request.get_json()
        events = body.get("events", [])
        for event in events:
            if event.get("type") == "message" and event["message"].get("type") == "text":
                text = event["message"]["text"]
                requests.post(
                    "https://discord.com/api/webhooks/1392570606783959150/PKn8bECItnaFWk3TD_pWtse0Gn3PB17zVp_CzZoNSDaCsbU_2QmMyBeiAuEP1Hj5hJ0C",
                    json={"content": text}
                )
        return ("OK", 200)
    except Exception as e:
        return (str(e), 500)
