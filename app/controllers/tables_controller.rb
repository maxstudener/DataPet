class TablesController < ApplicationController

  before_filter :set_connection, :except => [ :relations ]
  before_filter :set_table

  def columns
    render json: @connection.columns(params[:schema_name], params[:table_name]).to_json
  end

  def query
    sql = params[:sqlQuery]
    limit = params[:maxRows]
    connection_name = params[:connection_name]

    # in case the user is being mean
    if sql.match(/SELECT/i) && !sql.match(/SELECT TOP/i)
      raise 'You query was bad, and you should feel bad.'
    end

    result_set = @connection.execute_query(@connection.create_query(@full_table_name, sql, limit))

    relations = []
    mongoid_relations = Relation.includes(:to_connection).where(from_connection_id: connection_name, from_table_name: Query.unquote_table(@full_table_name)).all

    mongoid_relations.each do |relation|
      relation['to_connection_name'] = relation.to_connection.name
      relations << relation
    end

    if result_set.present?
      render json: { columns: result_set.first.keys, rows: result_set.map{ |row| row.values }, relations: relations }
    else
      render json: { columns: [], rows: [], relations: relations }
    end
  end

end