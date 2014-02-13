class ConnectionAttributes
 include Mongoid::Document

 has_many :from_relations, class_name: 'Relation', inverse_of: :from_connection
 has_many :to_relations, class_name: 'Relation', inverse_of: :to_connection
end