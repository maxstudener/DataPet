class DatabaseRelationsController < ApplicationController

  def create
    cleanup_nested_attributes
    DatabaseRelation.create(params[:database_relation])

    render :json => @response.json
  end

  def list
    @response.set_data(DatabaseRelation.all)

    render :json => @response.json
  end

  def destroy
    database_relation = DatabaseRelation.find(params[:id])
    database_relation.destroy

    render :json => @response.json
  end

  def show
    database_relation = DatabaseRelation.find(params[:id])
    @response.set(:relation, database_relation)
    @response.set(:where_clauses_attributes, database_relation.where_clauses)
    @response.set(:join_clauses_attributes, database_relation.join_clauses)

    render :json => @response.json
  end

  def query
    relation_data = RelationCalculator.new(params[:id], params[:query_data])

    @response.set(:columns, relation_data.columns)
    @response.set(:rows , relation_data.rows)
    @response.set(:relations, relation_data.relations)
    @response.set(:query, relation_data.sql)

    render json: @response.json
  end

private

  def cleanup_nested_attributes
    where_clauses = params[:database_relation][:where_clauses_attributes]
    if where_clauses.present?
      where_clauses.each{ |where_clause| where_clause[:id] = nil }
      params[:database_relation][:where_clauses_attributes] = where_clauses
    else
      params[:database_relation][:where_clauses_attributes] = []
    end
    join_clauses = params[:database_relation][:join_clauses_attributes]
    if join_clauses.present?
      join_clauses.each{ |join_clause| join_clause[:id] = nil }
      params[:database_relation][:join_clauses_attributes] = join_clauses
    else
      params[:database_relation][:join_clauses_attributes] = []
    end
  end

end