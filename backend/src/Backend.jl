module Backend

using Genie

# Genie.config.cors_headers["Access-Control-Allow-Origin"] = "*"

const up = Genie.up
export up

function main()
  Genie.genie(; context = @__MODULE__)
end

end
