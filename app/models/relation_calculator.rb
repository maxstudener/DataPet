class RelationCalculator

  def initialize(connection_name, table_name, relation_name, data_hash)
    @table_name = table_name
    @data_hash = data_hash

    # find the configuration for this relation
    relation = Relation.where(from_connection_id: connection_name, from_table_name: table_name, relation_name: relation_name).first
    @connection_name = relation.to_connection_id
    @relation_table_name = relation.to_table_name
    @where_clauses = relation.where_clauses

    @sql = "SELECT * FROM \"#{Query.quote_table(@relation_table_name)}\" WHERE "

    case relation.relation_type
      when 'has'
        add_where_clauses

      when 'has_through'
        through_relation = RelationCalculator.new(connection_name, table_name, relation.through_relation.relation_name, data_hash)

        @join_data = through_relation.compute
        @join_clauses = relation.join_clauses

        add_join_clauses

        if @where_clauses.present?
          @sql += " AND "
          add_where_clauses
        end
      else
        raise "#{relation.relation_type} relationship is not supported."
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
    join_column = join['join_column']
    from_column = join['from_column']

    join_data = @join_data.collect{ |row| row[from_column.downcase.to_sym] }.join("','")
    raise 'Cannot join without values.' if join_data.blank?

    "\"#{Query.quote_table(@relation_table_name+'.'+join_column)}\" IN ('#{join_data}')"
  end

  def create_where_clause(where)
    column = where['to_table_column']
    operator = where['comparison_operator']

    case where['comparison_type']
      when 'Column'
        my_value = @data_hash[where['comparison_value'].to_s.downcase]
      when 'Value'
        my_value = where['comparison_value']

      else
        raise "This type of WHERE clause is not supported."
    end

    "\"#{Query.quote_table(@relation_table_name+'.'+column)}\" #{comparison_sql(operator, my_value)}"
  end

  def comparison_sql(comparison_operator, my_value)
    comparison = ''
    case comparison_operator
      when 'Equal To'
        comparison = '='
      when 'Greater Than'
        comparison = '>'
      when 'Less Than'
        comparison = '<'
      when 'Like'
        return "LIKE %'#{my_value}'%"
      when 'In'
        comparison = 'IN'
      when 'Not Equal To'
        comparison = '!='
      when 'Not NULL'
        return 'IS NOT NULL'
      when 'NULL'
        return 'IS NULL'
      else
        raise "#{comparison} operator is not supported."
    end
    "#{comparison} '#{my_value}'"
  end

  def sql
    @sql
  end

  def compute
    connection = Connection.get(@connection_name)
    connection.execute_query(connection.create_query(@table_name, @sql), true)
  end

  def result_set
    @result_set
  end

  def columns
    @result_set.present? ? @result_set.first.keys : []
  end

  def rows
    @result_set.present? ? @result_set.map{ |row| row.values } : []
  end

  def relations
    relations = []
    mongoid_relations = Relation.includes(:to_connection).where(from_connection_id: @connection_name, from_table_name: Query.unquote_table( @relation_table_name)).all
    mongoid_relations.each do |relation|
      relation['to_connection_name'] = relation.to_connection.name
      relations << relation
    end
    relations
  end

end