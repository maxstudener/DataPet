class CreateJoinClauses < ActiveRecord::Migration
  def change
    create_table :join_clauses do |t|
      t.integer :database_relation_id
      t.string :from_column_name
      t.string :to_column_name

      t.timestamps
    end
  end
end
