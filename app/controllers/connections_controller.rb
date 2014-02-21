class ConnectionsController < ApplicationController

  def index
    respond_to do |format|
      format.html
      format.json { render json: ConnectionAttributes.all }
    end
  end

  def new
  end

  def show
    @connection = ConnectionAttributes.where(id: params[:id]).first
    respond_to do |format|
      format.html
      format.json { render json: @connection }
    end
  end

  def create
    con = ConnectionAttributes.create!(params["connection"])
    render json: con
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

  def destroy
    connection = ConnectionAttributes.find(params[:id])
    if connection.destroy
      render nothing: true
    else
      raise 'There was an error destroying the connection.'
    end

  end

end

