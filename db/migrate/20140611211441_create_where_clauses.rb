class CreateWhereClauses < ActiveRecord::Migration
  def change
    create_table :where_clauses do |t|
      t.integer :database_relation_id
      t.string :column_name
      t.string :comparison_operator
      t.string :comparison_type
      t.string :comparison_value

      t.timestamps
    end
  end
end
