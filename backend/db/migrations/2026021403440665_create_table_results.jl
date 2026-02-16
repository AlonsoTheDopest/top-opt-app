module CreateTableResults

import SearchLight.Migrations: create_table, column, columns, pk, add_index, drop_table, add_indices

function up()
  create_table(:results) do
    [
      pk()
      columns([
        :beam_type => :string,
        :load => :float,
        :load_location => :float,
        :volume_fraction => :float,
        :iterations => :integer,
        :image => :string
      ])
    ]
  end
end

function down()
  drop_table(:results)
end

end
