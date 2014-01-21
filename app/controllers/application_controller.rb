class ApplicationController < ActionController::Base
  protect_from_forgery

  def set_connection
    @connection = Connection.get(params[:connection_name])
  end

  def set_table
    schema_name = params[:schema_name]
    table_name = params[:table_name]

    @full_table_name = schema_name.present? ? "#{schema_name}.#{table_name}" : table_name
  end

end
