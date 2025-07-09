import requests

DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1392570606783959150/PKn8bECItnaFWk3TD_pWtse0Gn3PB17zVp_CzZoNSDaCsbU_2QmMyBeiAuEP1Hj5hJ0C"

def handler(request):
    if request.method == "POST":
        try:
            body = request.get_json()
            events = body.get("events", [])
            for event in events:
                if event.get("type") == "message" and event["message"].get("type") == "text":
                    text = event["message"]["text"]
                    requests.post(
                        DISCORD_WEBHOOK_URL,
                        json={"content": text}
                    )
            return ("OK", 200)
        except Exception as e:
            return (f"Error: {str(e)}", 500)
    else:
        return ("Only POST allowed", 405)
