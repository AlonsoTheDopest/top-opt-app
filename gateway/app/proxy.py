from fastapi import Request, Response, HTTPException
import httpx
from .config import ROUTES

async def forward_request(service: str, path: str, request: Request) -> Response:
    if service not in ROUTES:
        raise HTTPException(status_code=404, detail="Service not found")
    target_base = ROUTES[service].rstrip("/")
    target_url = f"{target_base}/{path.lstrip('/')}"

    # prepare headers: copy except hop-by-hop
    excluded_headers = {
        "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
        "te", "trailers", "transfer-encoding", "upgrade"
    }
    headers = {k: v for k, v in request.headers.items() if k.lower() not in excluded_headers}

    async with httpx.AsyncClient() as client:
        req_content = await request.body()
        try:
            resp = await client.request(
                request.method,
                target_url,
                params=dict(request.query_params),
                headers=headers,
                content=req_content,
                follow_redirects=True,
                timeout=None,
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Upstream request failed: {str(e)}")
    # build FastAPI Response preserving status and headers (filter hop-by-hop)
    response_headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded_headers}
    return Response(content=resp.content, status_code=resp.status_code, headers=response_headers, media_type=resp.headers.get("content-type"))
