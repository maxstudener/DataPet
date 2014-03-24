class RelationsController < ApplicationController

  def index
    respond_to do |format|
      format.html
      format.json { render json: Relation.all }
    end
  end

  def new
  end

  def show
    @relation = Relation.where(id: params[:id]).first
    respond_to do |format|
      format.html
      format.json { render json: @relation }
    end
  end

  def create
    relation = Relation.create!(params["relation"])
    render json: relation
  end

  def edit
  end

  def update
    relation = Relation.where(id: params[:id]).first
    relation.update_attributes!(params["relation"])

    render json: relation
  end

  def destroy
    relation = Relation.find(params[:id])
    if relation.destroy
      render nothing: true
    else
      raise 'There was an error destroying the relation.'
    end
  end

  def query
    set_table

    # fetch the relative data, columns, rows, and final sql query
    relation = RelationCalculator.new(params[:connection_name], @full_table_name, params[:relation_name], params[:rowData], params[:maxRows])

    render json: {
                   columns: relation.columns,
                   rows: relation.rows,
                   relations: relation.relations,
                   query: relation.sql
                 }
  end

end