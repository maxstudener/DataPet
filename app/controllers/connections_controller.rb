class ConnectionsController < ApplicationController
  if DataPetAuthorization::REQUIRE_AUTH
    http_basic_authenticate_with :name => DataPetAuthorization::USERNAME, :password => DataPetAuthorization::PASSWORD, only: [ :new, :edit, :show, :create, :update, :destroy ]
  end

  def index
    respond_to do |format|
      format.html
      format.json { render json: ConnectionAttributes.all_without_creds }
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

  def test
    begin
      # timeout after 10 seconds so we dont hang the server
      Timeout::timeout(10) {
        con = Connection.get_connection(params['connection'])
        # attempt to execute a query against the connection
        con.tables
      }
    rescue TimeoutError => e
      render json => { :status => 'fail', :message => 'The connection took too long to respond.' } and return
    rescue Exception => e
      render :json => { :status => 'fail', :message => e.message } and return
    end
    render :json => { :status => 'success', :message => 'The connection test was successful.' }
  end

  def edit
  end

  def update
    connection = ConnectionAttributes.where(id: params[:id]).first
    connection.update_attributes!(params["connection"])

    render json: connection
  end

  def query
    set_connection
    sql = params[:sqlQuery]
    connection_id = params[:connection_name]

    query = @connection.create_query('', sql)
    result_set = @connection.execute_query(query)

    mongoid_relations = Relation.includes(:to_connection).where(
        from_connection_id: connection_id,
        from_table_name: @connection.unformat_table_name(@full_table_name)
    ).all

    relations = mongoid_relations.inject([]) do |relations, relation|
      relation['to_connection_name'] = relation.to_connection.name
      relations << relation
    end

    if result_set.present?
      render json: { columns: result_set.first.keys, rows: result_set.map{ |row| row.values }, relations: relations }
    else
      render json: { columns: [], rows: [], relations: relations }
    end
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

