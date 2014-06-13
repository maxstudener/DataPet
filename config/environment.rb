# Load the rails application
require File.expand_path('../application', __FILE__)

require 'sequel'

Dir.glob("#{File.expand_path('../../lib', __FILE__)}/*.jar").each do |file| 
  require "lib/#{file.split('/').last}"  
end

# OpenEdge / Progress 10.2B
if File.exists?(File.expand_path('../../lib/openedge.jar', __FILE__)) &&
   File.exists?(File.expand_path('../../lib/pool.jar', __FILE__))

  java_import 'com.ddtek.jdbc.openedge.OpenEdgeDriver'

end

# PostgreSQL
if File.exists?(File.expand_path('../../lib/postgresql.jar', __FILE__))
  java_import 'org.postgresql.Driver'
end

# Initialize the rails application
DataPet::Application.initialize!
