import requests

DISCORD_WEBHOOK_URL = "你的 Discord Webhook URL"

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
