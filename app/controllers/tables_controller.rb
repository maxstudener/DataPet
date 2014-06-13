class TablesController < ApplicationController

  def query
    database = Database.find(params[:id])
    @response.set(:columns, database.columns_for(params[:query_data]))
    @response.set(:rows, database.send_query(params[:query_data]))
    @response.set(:relations, database.relations_for(params[:query_data]))

    render :json => @response.json
  end

  def columns
    database = Database.find(params[:id])
    @response.set(:columns, database.columns_for(params[:query_data]))

    render :json => @response.json
  end

  def database_relations
    database = Database.find(params[:id])
    @response.set(:relations, database.relations_for(params[:query_data]))

    render :json => @response.json
  end

end