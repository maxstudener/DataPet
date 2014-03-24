class ProgressConnection < Connection

  def initialize(configuration)
    @configuration = configuration
    @db = establish_connection
  end

  def tables
    # return an array of schema + table names seperated by '.'
    table_fetch_sql = "SELECT OWNER+'.'+TBL AS FULLTABLENAME FROM sysprogress.SYSTABLES_FULL"
    result_set = execute_query(table_fetch_sql, true)
    result_set.collect { |row| row[:fulltablename] }
  end

  def columns(schema_name, table_name)
    column_fetch_sql = "SELECT * FROM sysprogress.SYSCOLUMNS where TBL = '#{table_name}'"
    result_set = execute_query(column_fetch_sql, true)
    result_set.collect { |row| row[:col] }
  end

  def create_limit_statement(max_rows)
    ''
  end

  def create_top_statement(max_rows)
    " TOP #{max_rows}"
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
