# map gateway service name -> internal docker service host and port
ROUTES = {
    "backend": ("http://backend:8000"),
    "frontend": ("http://frontend:3000"),
    "mesh": ("http://mesh-utils:8000")
}