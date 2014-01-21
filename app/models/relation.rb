class Relation < ActiveRecord::Base
  attr_accessible :connection_name, :table_name, :relation_name, :relation_type, :relation_connection_name, :relation_table_name, :through_relation_id

  has_many :join_clauses
  has_many :where_clauses
  has_one :through_relation, class_name: 'Relation', foreign_key: :id, primary_key: :through_relation_id

  def create_where_clauses(where_clauses)
    where_clauses.each do |_, values|
      WhereClause.create(values.merge({relation_id: self.id}))
    end
  end

  def create_join_clauses(join_clauses)
    join_clauses.each do |_, values|
      JoinClause.create(values.merge({relation_id: self.id}))
    end
  end

end
