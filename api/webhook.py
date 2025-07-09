import json
import requests

def handler(request):
    if request.method == "POST":
        try:
            body = request.get_json()
            events = body.get("events", [])
            for event in events:
                if event.get("type") == "message" and event["message"].get("type") == "text":
                    text = event["message"]["text"]
                    requests.post(
                        "https://discord.com/api/webhooks/你的DiscordWebhookURL",
                        json={"content": text}
                    )
            return ("OK", 200)
        except Exception as e:
            return (str(e), 500)
    else:
        return ("Only POST allowed", 405)
