# Load the rails application
require File.expand_path('../application', __FILE__)

require 'sequel'

Dir.glob("#{File.expand_path('../../lib', __FILE__)}/*.jar").each do |file| 
  require "lib/#{file.split('/').last}"  
end

# open edge driver 10.2B
if File.exists?(File.expand_path('../../lib/openedge.jar', __FILE__)) &&
   File.exists?(File.expand_path('../../lib/pool.jar', __FILE__))

  java_import 'com.ddtek.jdbc.openedge.OpenEdgeDriver'

end

ENV['FREETDSCONF'] = File.expand_path(File.dirname(__FILE__)) + "/freetds.conf"

# Initialize the rails application
DataPet::Application.initialize!
