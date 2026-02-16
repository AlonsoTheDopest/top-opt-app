using SearchLight

SearchLight.Configuration.load(context = @__MODULE__)
SearchLight.connect()
SearchLight.Migrations.init()
SearchLight.Migrations.up()
