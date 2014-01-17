class TablesController < ApplicationController

  before_filter :set_connection

  def columns
    render json: @connection.columns(params[:schema_name], params[:table_name]).to_json
  end

  def query
    sql = params[:sql]
    limit = params[:limit]
    connection_name = params[:connection_name]
    schema_name = params[:schema_name]
    table_name = params[:table_name]

    # use a schema if one is present
    full_table_name = schema_name.present? ? "#{schema_name}.#{table_name}" : table_name

    result_set = @connection.execute_query(@connection.create_query(full_table_name, sql, limit))
    relations = Relation.find_all_for_table_name(connection_name, Query.unquote_table(full_table_name))

    render json: { columns: result_set.first.keys, rows: result_set.map{ |row| row.values }, relations: relations }
  end

  # this is for testing only
  def relations
    connection_name = params[:connection_name]
    schema_name = params[:schema_name]

    table_name = params[:table_name]

    full_table_name = schema_name.present? ? "#{schema_name}.#{table_name}" : table_name

    relations = Relation.find_all_for_table_name(connection_name, Query.unquote_table(full_table_name))
    render json: { relations: relations }
  end

end