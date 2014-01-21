class RelationsController < ApplicationController

  before_filter :set_table

  # this is a debugging route with basic get param filter
  # example /relations?connection_name=test
  def index
    render json: params.reject{|k,_| k=='action' || k=='controller' }.inject(Relation.all){|json, p| json.select{|j| j[p[0]].to_s.match(/#{p[1]}/i) } }
  end

  def new
    @relation = Relation.new
  end

  def create
    relation =  Relation.create(params[:relation])
    relation.create_where_clauses(params[:where_clauses] || [])
    relation.create_join_clauses(params[:join_clauses] || []) if params[:relation][:relation_type] == 'has_many_through'
    flash[:success] = 'Relation Saved!'
    redirect_to request.referrer
  end

  def query
    connection_name = params[:connection_name]

    # fetch the relative data, columns, rows, and final sql query
    relation = RelationCalculator.new(connection_name, @full_table_name, params[:relation_name], params[:rowData])
    result_set = relation.result_set

    # get the relations for the new connectionWindow
    relations = Relation.where(connection_name: connection_name, table_name: Query.unquote_table(relation.relation_table_name)).all

    render json: {
                   columns: result_set.present? ? result_set.first.keys : [],
                   rows: result_set.map{ |row| row.values },
                   relations: relations,
                   query: relation.sql
                 }
  end

end