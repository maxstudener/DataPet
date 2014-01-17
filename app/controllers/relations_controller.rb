class RelationsController < ApplicationController

  def query
    connection_name = params[:connection_name]
    schema_name = params[:schema_name]
    table_name = params[:table_name]

    # use a schema if one is present
    full_table_name = schema_name.present? ? "#{schema_name}.#{table_name}" : table_name

    # fetch the relative data, columns, rows, and final sql query
    relation = Relation.new(connection_name, full_table_name, params[:relation_name], params[:rowData])
    result_set = relation.result_set

    # get the relations for the new connectionWindow
    relations = Relation.find_all_for_table_name(relation.relation_connection_name, Query.unquote_table(relation.relation_table_name))

    render json: {
                   columns: result_set.present? ? result_set.first.keys : [],
                   rows: result_set.map{ |row| row.values },
                   relations: relations,
                   query: relation.sql
                 }
  end

end