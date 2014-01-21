class CreateJoinClauses < ActiveRecord::Migration
  def change
    create_table :join_clauses do |t|
      t.string :join_column
      t.string :from_column
      t.integer :relation_id


      t.timestamps
    end
  end
end
