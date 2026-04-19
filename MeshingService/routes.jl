using Genie.Router, Genie.Requests

route("/") do
  serve_static_file("welcome.html")
end