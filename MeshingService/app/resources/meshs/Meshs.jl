module Meshs

import SearchLight: AbstractModel, DbId
import Base: @kwdef

export Mesh

@kwdef mutable struct Mesh <: AbstractModel
  id::DbId = DbId()
  length::Float64 = 0.0
  height::Float64 = 0.0
  load_edge::String = ""
  load_location::Float64 = 0.0
end

end
