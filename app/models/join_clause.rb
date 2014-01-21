class JoinClause < ActiveRecord::Base
  attr_accessible :from_column, :join_column, :relation_id
end
