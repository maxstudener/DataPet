class MysqlConnection < Connection

  def initialize(configuration)
    @configuration = configuration
    @db = establish_connection
  end

  def tables
    table_fetch_sql = "SELECT CONCAT(TABLE_SCHEMA, '.', TABLE_NAME) AS FullTableName from information_schema.tables"
    table_fetch_sql += " WHERE TABLE_SCHEMA = '#{database}'" if database.present?
    result_set = execute_query(table_fetch_sql, true)
    result_set.collect { |row| row[:FullTableName] }
  end

  def columns(schema, table_name)
    column_fetch_sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '#{schema}' AND TABLE_NAME = '#{table_name}'"
    result_set = execute_query(column_fetch_sql, true)
    result_set.collect { |row| row[:COLUMN_NAME] }
  end

  def create_limit_statement(max_rows)
    " LIMIT #{max_rows}"
  end

  def create_top_statement(max_rows)
    ''
  end

  def table_interpolation_character
    # this is the character that will surround the schema and table name when generating sql
    '`'
  end

  def format_table_name(table_name)
    super(table_name, table_interpolation_character)
  end

  def unformat_table_name(table_name)
    super(table_name, table_interpolation_character)
  end

  def database
    @configuration[:database].present? ? @configuration[:database] : nil
  end

end
