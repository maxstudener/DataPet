class CreateWhereClauses < ActiveRecord::Migration
  def change
    create_table :where_clauses do |t|
      t.string :relation_table_column
      t.string :comparison_operator
      t.string :comparison_type
      t.string :comparison_value
      t.integer :relation_id

      t.timestamps
    end
  end
end
