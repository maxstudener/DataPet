class DatabasesController < ApplicationController
  if DataPetAuthorization::REQUIRE_AUTH
    http_basic_authenticate_with name: DataPetAuthorization::USERNAME,
                                 password: DataPetAuthorization::PASSWORD,
                                 only: [ :new, :edit, :show, :create, :update, :destroy ]
  end

  def test
    begin
      connection = Database.new(params[:database])
      connection.test_connection
    rescue Exception => e
      @response.register_error(e)
    end

    render :json => @response.json
  end

  def create
    @response.set(:database, Database.create!(params['database']))

    render :json => @response.json
  end

  def list
    @response.set_data(Database.select([:name, :id]).all)

    render :json => @response.json
  end

  def edit
    @database_id = params[:id]
  end

  def show
    @response.set_data(Database.find(params[:id]))

    render :json => @response.json
  end

  def update
    database = Database.find(params[:id])
    database.update_attributes(params[:database])

    render :json => @response.json
  end

  def destroy
    database = Database.find(params[:id])
    database.destroy

    render :json => @response.json
  end

  def tables
    database = Database.find(params[:id])
    @response.set(:tables, database.tables)

    render :json => @response.json
  end

end