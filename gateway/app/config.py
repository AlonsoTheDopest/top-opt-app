# map gateway service name -> internal docker service host and port
ROUTES = {
    "backend": ("http://genie-backend:8000"),
    "frontend": ("http://react-frontend:3000"),
    "mesh-utils": ("http://mesh-utils:8000")
}