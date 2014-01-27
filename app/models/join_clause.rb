class JoinClause < ActiveRecord::Base
  attr_accessible :from_column, :join_column, :relation_id

  validates_presence_of :from_column, :join_column, :relation_id
end
