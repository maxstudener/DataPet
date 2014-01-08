class SqlServerConnection < Connection

  def initialize(configuration)
    @configuration = configuration
    @db = establish_connection
    @tables = tables
  end

  def tables
    # return an array of schema + table names seperated by '.'
    table_fetch_sql = "SELECT SCHEMA_NAME(schema_id)+'.'+name AS FullTableName FROM sys.tables"
    result_set = execute_query(table_fetch_sql, true)
    result_set.collect { |row| row['FullTableName'] }
  end

end
