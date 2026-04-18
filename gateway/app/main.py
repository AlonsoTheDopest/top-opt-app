from fastapi import FastAPI, Request
from .proxy import forward_request

app = FastAPI(title="API Gateway")

@app.get("/health")
async def health():
    return {"status": "ok"}


# Generic proxy route: forwards any method
@app.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(service: str, path: str, request: Request):
    return await forward_request(service, path, request)