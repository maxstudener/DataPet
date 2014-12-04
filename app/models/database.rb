require 'timeout'
class Database < ActiveRecord::Base

  def adapter
    "ConnectionAdapter::#{self.database_type}Adapter".constantize
  end

  def test_connection
    @jdbc_connection = JdbcConnection.new(self)
    @jdbc_connection.test_connection
  end

  def establish_sequel_connection
    Timeout::timeout(10) {
      Sequel.connect(sequel_configuration)
    }
  end

  def sequel_configuration
    {
        username: self.username,
        password: self.password,
        url: self.url,
        adapter: 'jdbc'
    }
  end

  def tables
    execute_query(adapter::TABLE_FETCH_SQL)
  end

  def execute_query(query, *sql_params)
    begin
      db = establish_sequel_connection

      sql_params.each{|parameter| query.sub!('?', parameter) if parameter.present? }

      Rails.logger.info query
      db[query].all
    ensure
      db.disconnect if db.present?
    end
  end

  def format_table_name(table_name)
    # remove any tics present
    table_name = unformat_table_name(table_name)

    # surround the schema and table names with tics, separated by a period
    %Q|#{tic}#{table_name.split('.').join("#{tic}.#{tic}")}#{tic}|
  end

  def unformat_table_name(table_name)
    table_name.gsub(tic, '')
  end

  def limit_statement(max_rows)
    adapter::USE_LIMIT ? " LIMIT #{max_rows} " : ''
  end

  def top_statement(max_rows)
    adapter::USE_TOP ? " TOP #{max_rows} " : ''
  end

  def send_query(query_params)
    query = DatabaseQuery.new(self, query_params[:schema_name], query_params[:table_name], query_params[:query], query_params[:max_rows])
    execute_query(query.sql)
  end

  def columns_for(query_params)
    execute_query(adapter::COLUMN_FETCH_SQL.dup, query_params[:table_name], query_params[:schema_name]).map{ |row| row[:name] }
  end

  def relations_for(query_params)
    full_table_name = DatabaseQuery.full_table_name(query_params[:schema_name], query_params[:table_name])
    DatabaseRelation.where(from_database_id: self.id, from_table_name: full_table_name);
  end

  def tic
    adapter::TIC
  end

end
