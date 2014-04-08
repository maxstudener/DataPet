# Load the rails application
require File.expand_path('../application', __FILE__)

require 'sequel'

# open edge driver 10.2B
if File.exists?(File.expand_path('../../lib/openedge.jar', __FILE__)) &&
   File.exists?(File.expand_path('../../lib/pool.jar', __FILE__))

  require 'lib/openedge.jar'
  require 'lib/pool.jar'
  java_import 'com.ddtek.jdbc.openedge.OpenEdgeDriver'

end

# jtds driver
if File.exists?(File.expand_path('../../lib/jtds.jar', __FILE__))
  require 'lib/jtds.jar'
end

# mysql driver
if File.exists?(File.expand_path('../../lib/mysql.jar', __FILE__))
  require 'lib/mysql.jar'
end

# postgresql driver
if File.exists?(File.expand_path('../../lib/postgresql.jar', __FILE__))
  require 'lib/postgresql.jar'
end

ENV['FREETDSCONF'] = File.expand_path(File.dirname(__FILE__)) + "/freetds.conf"

# Initialize the rails application
DataPet::Application.initialize!
