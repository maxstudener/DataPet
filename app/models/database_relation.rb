class DatabaseRelation < ActiveRecord::Base
  attr_accessible :from_database_id, :from_table_name, :name, :relation_type, :to_database_id, :to_table_name, :through_relation_id, :where_clauses_attributes, :join_clauses_attributes

  has_many :where_clauses, dependent: :destroy
  has_many :join_clauses, dependent: :destroy

  accepts_nested_attributes_for :where_clauses, :join_clauses

end
