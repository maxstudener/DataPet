class CreateDatabaseRelations < ActiveRecord::Migration
  def change
    create_table :database_relations do |t|
      t.string :name
      t.integer :from_database_id
      t.integer :to_database_id
      t.string :from_table_name
      t.string :to_table_name
      t.string :relation_type
      t.integer :through_relation_id

      t.timestamps
    end
  end
end
