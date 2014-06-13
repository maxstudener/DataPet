class JoinClause < ActiveRecord::Base
  attr_accessible :database_relation_id, :from_column_name, :through_relation_id, :to_column_name
end
