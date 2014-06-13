class CreateDatabases < ActiveRecord::Migration
  def change
    create_table :databases do |t|
      t.string :name
      t.string :database_type
      t.string :username
      t.string :password
      t.string :url

      t.timestamps
    end
  end
end
