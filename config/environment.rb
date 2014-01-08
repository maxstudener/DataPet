# Load the rails application
require File.expand_path('../application', __FILE__)

ENV['FREETDSCONF'] = File.expand_path(File.dirname(__FILE__)) + "/freetds.conf"


# Initialize the rails application
DataPet::Application.initialize!
