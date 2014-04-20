# Load the rails application
require File.expand_path('../application', __FILE__)

require 'sequel'

# require all jar files in lib
Dir["../../lib/*.jar"].each {|file| require file }

# open edge driver 10.2B / of course Progress/OpenEdge requires special treatment
if File.exists?(File.expand_path('../../lib/openedge.jar', __FILE__)) &&
   File.exists?(File.expand_path('../../lib/pool.jar', __FILE__))

  java_import 'com.ddtek.jdbc.openedge.OpenEdgeDriver'

end

ENV['FREETDSCONF'] = File.expand_path(File.dirname(__FILE__)) + "/freetds.conf"

# Initialize the rails application
DataPet::Application.initialize!
