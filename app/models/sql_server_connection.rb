class SqlServerConnection < Connection

  def initialize(configuration)
    @configuration = configuration
    @db = establish_connection
  end

  def tables
    # return an array of schema + table names seperated by '.'
    table_fetch_sql = "SELECT SCHEMA_NAME(schema_id)+'.'+name AS FullTableName FROM sys.tables"
    result_set = execute_query(table_fetch_sql, true)
    result_set.collect { |row| row[:fulltablename] }
  end

  def columns(schema_name, table_name)
    column_fetch_sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '#{table_name}' AND TABLE_SCHEMA = '#{schema_name}'"
    result_set = execute_query(column_fetch_sql, true)
    result_set.collect { |row| row[:column_name] }
  end

end
