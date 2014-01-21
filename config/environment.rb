# Load the rails application
require File.expand_path('../application', __FILE__)

require 'sequel'

# open edge driver
require 'openedge.jar'
require 'pool.jar'
java_import 'com.ddtek.jdbc.openedge.OpenEdgeDriver'

# jtds driver
require 'jtds-1.3.1.jar'


ENV['FREETDSCONF'] = File.expand_path(File.dirname(__FILE__)) + "/freetds.conf"

# Initialize the rails application
DataPet::Application.initialize!
