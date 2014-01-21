class RelationCalculator

  def initialize(connection_name, table_name, relation_name, data_hash)
    @table_name = table_name
    @data_hash = data_hash

    # stores a list of column names to look up when bind_data is called
    @bind_columns = []

    # find the configuration for this relation
    relation = Relation.where(connection_name: connection_name, table_name: table_name, relation_name: relation_name).first

    # use different connection if relation configuration lists one
    # this allows for relations to another db
    @connection_name = relation.relation_connection_name || connection_name

    relation_type = relation.relation_type
    @relation_table_name = relation.relation_table_name

    @where_clauses = relation.where_clauses
    @sql = "SELECT * FROM \"#{Query.quote_table(@relation_table_name)}\" WHERE "

    case relation_type
      when 'has_many'
        add_where_clauses

      when 'has_many_through'
        through_relation = RelationCalculator.new(connection_name, table_name, relation.through_relation.relation_name, data_hash)

        @join_data = through_relation.compute
        @join_clauses = relation.join_clauses
        add_join_clauses

        if @where_clauses.present?
          @sql += " AND "
          add_where_clauses
        end
      else
        raise "#{relation_type} relationship is not supported."
    end
    @result_set = compute
  end

  def add_where_clauses
    where_clause_sql = @where_clauses.map{ |where| create_where_clause(where) }.join(' AND ')
    @sql += where_clause_sql
  end

  def add_join_clauses
    join_clause_sql = @join_clauses.map{ |join| create_join_clause(join) }.join(' AND ')
    @sql += join_clause_sql
  end

  def create_join_clause(join)
    puts "\n\n" + join.inspect + "\n\n"
    join_column = join.join_column
    from_column = join.from_column

    join_data = @join_data.collect{ |row| row[from_column.downcase.to_sym] }.join("','")
    raise 'Cannot join without values.' if join_data.blank?

    "\"#{Query.quote_table(@relation_table_name+'.'+join_column)}\" IN ('#{join_data}')"
  end

  def create_where_clause(where)
    column = where.relation_table_column
    operator = where.comparison_operator

    case where.comparison_type
      when 'Column'
        my_value = @data_hash[where.comparison_value.downcase]
      when 'Value'
        my_value = where.comparison_value

      else
        raise "This type of WHERE clause is not supported."
    end

    "\"#{Query.quote_table(@relation_table_name+'.'+column)}\" #{comparison_to_sql(operator)} '#{my_value}'"
  end

  def comparison_to_sql(comparison)
    case comparison
      when 'Equal To'
        '='
      when 'Greater Than'
        '>'
      when 'Less Than'
        '<'
      when 'Like'
        'LIKE'
      when 'In'
        'IN'
      when 'Not Equal To'
        '!='
      else
        raise "#{comparison} operator is not supported."
    end
  end

  def sql
    @sql
  end

  def relation_table_name
    @relation_table_name
  end

  def relation_connection_name
    @connection_name
  end

  def compute
    connection = Connection.get(@connection_name)
    connection.execute_query(connection.create_query(@table_name, @sql), true)
  end

  def result_set
    @result_set
  end

end