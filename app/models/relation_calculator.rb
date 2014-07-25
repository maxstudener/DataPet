class RelationCalculator

  def initialize(relation_id, query_data)
    @table_name = query_data[:table_name]

    # ensure that the column names are all lowercase
    @data_hash = query_data[:row_data].map do |k, v|
      { 'column'=> k.downcase, 'value' => v }
    end

    # find the configuration for this relation
    relation = DatabaseRelation.find(relation_id)
    @database_id = relation.to_database_id
    @relation_table_name = relation.to_table_name
    @where_clauses = relation.where_clauses
    @to_database = Database.find(@database_id)

    top_sql = query_data[:join].present? ? '' : @to_database.top_statement(query_data['max_rows'])
    limit_sql = query_data[:join].present? ? '' : @to_database.limit_statement(query_data['max_rows'])

    @sql = "SELECT #{top_sql} * FROM #{@to_database.format_table_name(@relation_table_name)} WHERE "

    case relation.relation_type
      when 'has'
        add_where_clauses
      when 'has_through'
        new_relation_id = relation.through_relation_id
        through_relation = RelationCalculator.new(new_relation_id, query_data.dup.merge({ join: true }))
        join_data = through_relation.compute

        @join_data = []
        # ensure that the column names are all lowercase
        join_data.each do |row|
          new_row = {}
          row.each do |key, value|
            new_row[key.downcase.to_sym] = value
          end
          @join_data << new_row
        end

        @join_clauses = relation.join_clauses

        add_join_clauses

        if @where_clauses.present?
          @sql += " AND "
          add_where_clauses
        end

      else
        raise "A #{relation.relation_type} relationship is not supported."
    end

    @sql += " #{limit_sql}"
    @result_set = compute
  end

  def add_where_clauses
    where_clause_sql = @where_clauses.map{ |where_clause| create_where_clause(where_clause) }.join(' AND ')
    @sql += where_clause_sql
  end

  def add_join_clauses
    all_joins =  []
    @join_data.each do |join_data|
      join_clause_sql = @join_clauses.map{ |join_clause| create_join_clause(join_clause, join_data) }.join(' AND ')
      all_joins << "(#{join_clause_sql})"
    end
    @sql += "(#{all_joins.join(' OR ' )})"
  end

  def create_join_clause(join_clause, join_data)
    join_column = join_clause.to_column_name
    from_column = join_clause.from_column_name
    join_value = join_data[from_column.downcase.to_sym]

    raise 'The through relation consisted of no data.' if join_data.blank?

    "#{@to_database.format_table_name(@relation_table_name+'.'+join_column)} = '#{join_value}'"
  end

  def create_where_clause(where_clause)
    column = where_clause.column_name
    operator = where_clause.comparison_operator

    case where_clause.comparison_type
      when 'Column'
        my_value = @data_hash.select{|column_hash| column_hash['column'] == where_clause.comparison_value.downcase }.first['value']
      when 'Value'
        my_value = where_clause.comparison_value
      else
        raise "This type of WHERE clause is not supported."
    end

    "#{@to_database.format_table_name(@relation_table_name+'.'+column)} #{comparison_sql(operator, my_value)}"
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
        return "LIKE '%#{my_value}%'"
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
    @to_database.execute_query(@sql)
  end

  def result_set
    @result_set
  end

  def columns
    @result_set.present? ? @result_set.first.keys : []
  end

  def rows
    @result_set.present? ? @result_set : []
  end

  def relations
    DatabaseRelation.where(from_database_id: @database_id, from_table_name: @to_database.unformat_table_name(@relation_table_name)).all
  end

end