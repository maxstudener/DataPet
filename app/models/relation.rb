class Relation

  include Mongoid::Document

  field :relation_name, type: String
  field :relation_type, type: String
  field :from_table_name, type: String
  field :to_table_name, type: String

  field :where_clauses, type: Hash
  field :join_clauses, type: Hash #used for has_many_through

  has_one :receiver, :class_name => 'Relation', :inverse_of => :through_relation
  belongs_to :through_relation,  :class_name => 'Relation', :inverse_of => :receiver

  belongs_to :from_connection, class_name: 'ConnectionAttributes', inverse_of: :from_relations
  belongs_to :to_connection, class_name: 'ConnectionAttributes', inverse_of: :to_relations

  # TODO
  # validates_presence_of :connection_name, :table_name, :relation_name, :relation_type, :relation_connection_name, :relation_table_name

end
