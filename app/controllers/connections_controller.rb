class ConnectionsController < ApplicationController

  before_filter :set_connection, :only => [ :tables ]

  def index
    render json: Connection.all.to_json
  end

  def tables
    render json: @connection.tables.to_json
  end

  def relations
    render :json => Relation.find_all_for_connection_name(params[:connection_name])
  end

end