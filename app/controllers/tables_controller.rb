class TablesController < ApplicationController

  before_filter :set_connection, :except => [ :relations ]
  before_filter :set_table

  def columns
    render json: @connection.columns(params[:schema_name], params[:table_name]).to_json
  end

  def query
    sql = params[:sqlQuery]
    max_rows = params[:maxRows]
    connection_id = params[:connection_name]

    query = @connection.create_query(@full_table_name, sql, max_rows)
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

  def relations
    render json: Relation.where(from_connection_id: params[:connection_name], from_table_name: @full_table_name).all
  end

end