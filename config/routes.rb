DataPet::Application.routes.draw do

  match '/main', controller: :application, action: :main
  root to: 'application#main'

  # relations for table with schema
  match 'connections/:connection_name/tables/:schema_name/:table_name/relations/:relation_name/:action', controller: :relations
  # relations for table without schema
  match 'connections/:connection_name/tables/:table_name/relations/:relation_name/:action', controller: :relations
  # table with schema
  match 'connections/:connection_name/tables/:schema_name/:table_name/:action', controller: :tables
  # table without schema
  match 'connections/:connection_name/tables/:table_name/:action', controller: :tables
  # connection
  match 'connections/:connection_name/:action', controller: :connections

  resources :connections do
    collection do
      post :test
      post :query
    end
  end
  resources :relations
  resources :sql_windows

end
