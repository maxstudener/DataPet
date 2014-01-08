class ApplicationController < ActionController::Base
  protect_from_forgery

  def set_connection
    @connection = Connection.get(params['connection_name'])
  end

end
