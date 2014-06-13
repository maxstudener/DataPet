class DatabaseQuery
  attr_reader :sql

  def initialize(database, schema_name, table_name, query, max_rows)
    top_sql = database.top_statement(max_rows)
    limit_sql = database.limit_statement(max_rows)
    table_name = database.format_table_name(DatabaseQuery.full_table_name(schema_name, table_name))

    @sql = "SELECT #{top_sql} * FROM #{table_name} #{modify_query(query)} #{limit_sql}"
    @sql.force_encoding('utf-8')
  end

  def modify_query(query)
    return '' unless query.present?
    query.match(/^WHERE/i) || query.match(/^ORDER\s{1}BY/i) ? query : " WHERE #{query}"
  end

  def self.full_table_name(schema_name, table_name)
    schema_name.present? ? [ schema_name, table_name ].join('.') : table_name
  end

end