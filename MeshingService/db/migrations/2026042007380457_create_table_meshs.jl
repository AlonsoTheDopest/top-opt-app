module CreateTableMeshs

import SearchLight.Migrations: create_table, column, columns, pk, add_index, drop_table, add_indices

function up()
  create_table(:meshs) do
    [
      pk()
      columns([
        :length => :float
        :height => :float
        :load_edge => :string
        :load_location => :float
      ])
    ]
  end
end

function down()
  drop_table(:meshs)
end

end
