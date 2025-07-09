from flask import Request

def handler(request: Request):
    if request.method == "GET":
        return ("Hello from webhook!", 200)
    elif request.method == "POST":
        return ("POST received!", 200)
    else:
        return ("Method not allowed", 405)
