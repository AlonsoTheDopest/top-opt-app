(pwd() != @__DIR__) && cd(@__DIR__) # allow starting app from bin/ dir

using Backend
const UserApp = Backend
Backend.main()
