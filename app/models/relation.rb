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

  def self.all_with_connection_names
    mongoid_relations = Relation.includes(:to_connection).all

    relations = mongoid_relations.inject([]) do |relations, relation|
      relation['from_connection_name'] = relation.from_connection.name
      relations << relation
    end
  end

end
