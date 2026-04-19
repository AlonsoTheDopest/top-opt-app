(pwd() != @__DIR__) && cd(@__DIR__) # allow starting app from bin/ dir

using MeshingService
const UserApp = MeshingService
MeshingService.main()
