class Relation

  # this model needs some breaking up and rewriting, but for now it is stable...ish
  RELATIONS_DIRECTORY = Rails.root.join('config', 'DataPet', 'relations')

  def initialize(connection_name, table_name, relation_name, data_hash)
    @table_name = table_name
    @data_hash = data_hash

    # stores a list of column names to look up when bind_data is called
    @bind_columns = []

    # find the configuration for this relation
    relation_hash = Relation.find(connection_name, table_name, relation_name)

    # use different connection if relation configuration lists one
    # this allows for relations to another db
    @connection_name = relation_hash[:connection] || connection_name

    relation_type = relation_hash[:type]
    @relation_table_name = relation_hash[:table]

    @where_clauses = relation_hash[:where]
    @sql = "SELECT * FROM \"#{Query.quote_table(@relation_table_name)}\" WHERE "

    case relation_type
      when 'has_many'
        add_where_clauses

      when 'has_many_through'
        through_relation = Relation.new(connection_name, table_name, relation_hash[:through], data_hash)

        @join_data = through_relation.compute
        @join_clauses = relation_hash[:join]
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
    join_column = join.keys.first
    from_column = join[join_column]['from']

    join_data = @join_data.collect{ |row| row[from_column.downcase.to_sym] }.join("','")
    raise "Cannot join without values." if join_data.blank?

    "\"#{Query.quote_table(@relation_table_name+'.'+join_column)}\" IN ('#{join_data}')"
  end

  def create_where_clause(where)
    column = where.keys.first
    operator = where[column]['is']

    if where[column]['my'].present? # match on column value
      my_value = @data_hash[where[column]['my'].downcase]
    elsif where[column]['value'].present? # match on specified value
      my_value = where[column]['value']
    else
      raise "This type of WHERE clause is not supported."
    end

    "\"#{Query.quote_table(@relation_table_name+'.'+column)}\" #{comparison_to_sql(operator)} '#{my_value}'"
  end

  def comparison_to_sql(comparison)
    case comparison
      when 'equal_to'
        '='
      when 'greater_than'
        '>'
      when 'less_than'
        '<'
      when 'like'
        'LIKE'
      when 'in'
        'IN'
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

  class << self

    def find(connection_name, table_name, relation_name)
      relations = find_all_for_table_name(connection_name, table_name)
      relations[relation_name].symbolize_keys!
    end

    def find_all_for_connection_name(connection_name)
      YAML::load(ERB.new(IO.read("#{RELATIONS_DIRECTORY}/#{connection_name}.yml")).result)
    end

    def find_all_for_table_name(connection_name, table_name)
      relations_hash = Relation.find_all_for_connection_name(connection_name)
      lookup_table_name = nil
      if relations_hash
        relations = relations_hash.select do |relation_table_name, _|
          if relation_table_name.upcase == table_name.upcase.gsub('"', '')
            lookup_table_name = relation_table_name
            true
          else
            false
          end
        end
        relations[lookup_table_name] || {}
      else
        []
      end
    end

  end

end