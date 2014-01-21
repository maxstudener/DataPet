class CreateRelations < ActiveRecord::Migration
  def change
    create_table :relations do |t|
      t.string :connection_name
      t.string :table_name
      t.string :relation_name
      t.string :relation_type
      t.string :relation_connection_name
      t.string :relation_table_name
      t.integer :through_relation_id

      t.timestamps
    end
  end
end
