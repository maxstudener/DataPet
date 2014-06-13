# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20140612211229) do

  create_table "database_relations", :force => true do |t|
    t.string   "name"
    t.integer  "from_database_id"
    t.integer  "to_database_id"
    t.string   "from_table_name"
    t.string   "to_table_name"
    t.string   "relation_type"
    t.integer  "through_relation_id"
    t.datetime "created_at",          :null => false
    t.datetime "updated_at",          :null => false
  end

  create_table "databases", :force => true do |t|
    t.string   "name"
    t.string   "database_type"
    t.string   "username"
    t.string   "password"
    t.string   "url"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  create_table "join_clauses", :force => true do |t|
    t.integer  "database_relation_id"
    t.string   "from_column_name"
    t.string   "to_column_name"
    t.datetime "created_at",           :null => false
    t.datetime "updated_at",           :null => false
  end

  create_table "where_clauses", :force => true do |t|
    t.integer  "database_relation_id"
    t.string   "column_name"
    t.string   "comparison_operator"
    t.string   "comparison_type"
    t.string   "comparison_value"
    t.datetime "created_at",           :null => false
    t.datetime "updated_at",           :null => false
  end

end
