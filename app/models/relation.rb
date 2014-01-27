class Relation < ActiveRecord::Base
  attr_accessible :connection_name, :table_name, :relation_name, :relation_type, :relation_connection_name, :relation_table_name, :through_relation_id

  has_many :join_clauses, dependent: :destroy
  has_many :where_clauses, dependent: :destroy
  has_one :through_relation, class_name: 'Relation', foreign_key: :id, primary_key: :through_relation_id

  validates_presence_of :connection_name, :table_name, :relation_name, :relation_type, :relation_connection_name, :relation_table_name


  def create_where_clauses(where_clauses)
    return unless where_clauses.present?
    where_clauses.select{ |where_clause| where_clause[:comparison_value].present? }.each do |where_clause|
      WhereClause.create!(where_clause.merge({relation_id: self.id}))
    end
  end

  def create_join_clauses(join_clauses)
    return unless join_clauses.present?
    join_clauses.select{ |join_clause| join_clause[:from_column].present? }.each do |join_clause|
      JoinClause.create!(join_clause.merge({relation_id: self.id}))
    end
  end

end
