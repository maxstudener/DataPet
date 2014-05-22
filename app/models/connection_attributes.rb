class ConnectionAttributes
 include Mongoid::Document

 has_many :from_relations, class_name: 'Relation', inverse_of: :from_connection
 has_many :to_relations, class_name: 'Relation', inverse_of: :to_connection

 def self.all_without_creds
   ConnectionAttributes.where(
       environment: Rails.env
   ).map{|c| { '_id' => c._id, name: c.name, structure: c.structure } }
 end
end