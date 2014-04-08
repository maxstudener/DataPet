class PostgresqlConnection < Connection
  # an example stub for creating new connection types

  def initialize(configuration)
    @configuration = configuration
    @db = establish_connection
  end

  def tables
    # create sql to fetch tables
    table_fetch_sql = "SELECT CONCAT(table_schema, '.', table_name) AS table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
    result_set = execute_query(table_fetch_sql, true)
    # return an array of tables
    result_set.collect { |row| row[:table_name] }
  end

  def columns(schema_name, table_name)
    # create sql to fetch columns
    column_fetch_sql = "SELECT column_name FROM information_schema.columns WHERE TABLE_SCHEMA = '#{schema_name}' AND TABLE_NAME = '#{table_name}'"
    result_set = execute_query(column_fetch_sql, true)
    # return an array of columns
    result_set.collect { |row| row[:column_name] }
  end

  def create_limit_statement(max_rows)
    " LIMIT #{max_rows}"
  end

  def create_top_statement(max_rows)
    ''
  end

  def table_interpolation_character
    # this is the character that will surround the schema and table name when generating sql
    '"'
  end

  def format_table_name(table_name)
    super(table_name, table_interpolation_character)
  end

  def unformat_table_name(table_name)
    super(table_name, table_interpolation_character)
  end

end
