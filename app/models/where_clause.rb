class WhereClause < ActiveRecord::Base
  attr_accessible :column_name, :comparison_operator, :comparison_type, :comparison_value, :database_relation_id
end
