DataPet::Application.routes.draw do

  match '/main', controller: :application, action: :main
  root to: 'application#main'

  resources :databases do
    collection do
      post :test
      get :list
    end

    member do
      get :details
      get :tables

      resource :tables do
        collection do
          post :query
          post :columns
          post :database_relations
          get :database_relations
        end
      end

    end
  end

  resources :database_relations do
    collection do
      get :list
    end

    member do
      post :query
    end
  end

end
