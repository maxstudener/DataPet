class WhereClause < ActiveRecord::Base
  attr_accessible :relation_table_column, :comparison_operator, :comparison_type, :comparison_value, :relation_id

  validates_presence_of :relation_table_column, :comparison_operator, :comparison_type, :comparison_value, :relation_id
end
