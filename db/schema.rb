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

ActiveRecord::Schema.define(:version => 20140120170028) do

  create_table "join_clauses", :force => true do |t|
    t.string   "join_column"
    t.string   "from_column"
    t.integer  "relation_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "relations", :force => true do |t|
    t.string   "connection_name"
    t.string   "table_name"
    t.string   "relation_name"
    t.string   "relation_type"
    t.string   "relation_connection_name"
    t.string   "relation_table_name"
    t.integer  "through_relation_id"
    t.datetime "created_at",               :null => false
    t.datetime "updated_at",               :null => false
  end

  create_table "where_clauses", :force => true do |t|
    t.string   "relation_table_column"
    t.string   "comparison_operator"
    t.string   "comparison_type"
    t.string   "comparison_value"
    t.integer  "relation_id"
    t.datetime "created_at",            :null => false
    t.datetime "updated_at",            :null => false
  end

end
