class ConnectionsController < ApplicationController

  def index
    render json: Connection.all.map{ |connection_name| { name: connection_name } }
  end

  def tables
    set_connection
    connection_name = params[:connection_name]

    tables = @connection.tables.map do |full_table_name|
      if full_table_name.match(/\./)
        schema_name, table_name = full_table_name.split('.')
      else
        schema_name = ''
        table_name = full_table_name
      end

      { connectionName: connection_name, schemaName: schema_name, tableName: table_name, fullTableName: full_table_name}
    end
    render json: tables.to_json
  end

end

