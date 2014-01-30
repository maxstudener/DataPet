class TablesController < ApplicationController

  before_filter :set_connection, :except => [ :relations ]
  before_filter :set_table

  def columns
    render json: @connection.columns(params[:schema_name], params[:table_name]).to_json
  end

  def query
    sql = params[:sql]
    limit = params[:limit]
    connection_name = params[:connection_name]

    # in case the user is being mean
    if sql.match(/SELECT/i) && !sql.match(/SELECT TOP/i)
      raise 'You query was bad, and you should feel bad.'
    end

    result_set = @connection.execute_query(@connection.create_query(@full_table_name, sql, limit))
    relations = Relation.where(connection_name: connection_name, table_name: Query.unquote_table(@full_table_name)).all

    if result_set.present?
      render json: { columns: result_set.first.keys, rows: result_set.map{ |row| row.values }, relations: relations }
    else
      render json: { columns: [], rows: [], relations: relations }
    end
  end

  def relations
    render json: Relation.where(connection_name: params[:connection_name], table_name: @full_table_name).all
  end

end