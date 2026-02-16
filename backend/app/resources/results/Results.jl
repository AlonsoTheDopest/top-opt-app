module Results

import SearchLight: AbstractModel, DbId
import Base: @kwdef

export Result

@kwdef mutable struct Result <: AbstractModel
  id::DbId = DbId()
  beam_type::String = ""
  load::Float64 = 0.0
  load_location_ratio::Float64 = 0.0
  volume_fraction::Float64 = 0.0
  iterations::Int = 0
  image_path::String = ""
end
end
