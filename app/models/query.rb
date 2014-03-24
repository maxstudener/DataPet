class Query
  attr_reader :sql

  def initialize(connection, table_name, user_query, max_rows)
    # generate a TOP statement if the connection uses 'TOP' or return ''
    top_sql = connection.create_top_statement(max_rows)

    # generate a LIMIT statement if the connection uses 'LIMIT' or return ''
    limit_sql = connection.create_limit_statement(max_rows)

    # format the table name for for use with the connection type
    formatted_table_name = connection.format_table_name(table_name)

    @sql = "SELECT #{top_sql} * FROM #{formatted_table_name} "

    if user_query.present?
      if user_query.match(/^WHERE/i) || user_query.match(/^ORDER\s{1}BY/i)
        # the user has supplied a WHERE or ORDER BY clause
      else
        # add the word 'WHERE' to allow lazily typed queries through the user interface
        @sql += " WHERE "
      end
      # add the user_query
      @sql += user_query
    end

    @sql += " #{limit_sql} "

    @sql.force_encoding('utf-8')
  end

end