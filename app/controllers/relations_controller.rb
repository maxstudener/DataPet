class RelationsController < ApplicationController

  def index
    # basic filter from query string
    @relations = params.reject{|k,_| k=='action' || k=='controller' }.inject(Relation.all){|json, p| json.select{|j| j[p[0]].to_s.match(/#{p[1]}/i) } }
  end

  def new
    @relation = Relation.new
  end

  def create
    # convert camelCased params to snake_case
    relation = snake_params(params[:relation])
    # the entire through relation object is passed back, we only want the id
    through_relation = relation.delete(:through_relation)
    relation[:through_relation_id] = through_relation[:id] if through_relation.present?
    # get the where_clauses for this relation, ignoring the autogenerated stub
    where_clauses = relation.delete(:where_clauses)
    # get the join_clauses for this relation, ignoring the autogenerated stub
    join_clauses = relation.delete(:join_clauses)
    begin
      relation =  Relation.create!(relation)
      relation.create_where_clauses(where_clauses)
      relation.create_join_clauses(join_clauses)
      message = 'Relation Saved!'
      message_class = 'success'
    rescue Exception => e
      message = e.message
      message_class = 'danger'
    end
    render json: { message: message, message_class: message_class }
  end

  def destroy
    relation = Relation.find(params[:id])
    if relation.destroy
      flash[:success] = 'The relation was successfully destroyed.'
    else
      flash[:error] = 'There was an error destroying the relation.'
    end
    redirect_to request.referrer
  end

  def query
    set_table

    # fetch the relative data, columns, rows, and final sql query
    relation = RelationCalculator.new(params[:connection_name], @full_table_name, params[:relation_name], params[:rowData])

    render json: {
                   columns: relation.columns,
                   rows: relation.rows,
                   relations: relation.relations,
                   query: relation.sql
                 }
  end

end