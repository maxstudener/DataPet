class Connection

  MODIFY_WORDS = %w[ delete update set alter create drop insert truncate index lock ]

  def initialize(configuration)
    @configuration = configuration
    @db = establish_connection
  end

  def establish_connection
    Sequel.connect(@configuration)
  end

  def create_query(table_name, sql, limit = 50)
    Query.new(table_name, sql, limit).sql
  end

  # relation.rb calls execute_query with safety_is_off = true
  # calling without a second parameter will attempt to ensure that the query is readonly
  def execute_query(sql, safety_is_off = false)
    if safety_is_off || is_select_query?(sql)
      Rails.logger.info sql
      @db[sql].all
    else
      raise 'Only SELECT statements are allowed.'
    end
  end

  def db
    @db
  end

  def is_select_query?(sql)
    queries = sql.split(';')
    queries.each do |query|
      return false unless query.match(/^SELECT/i)
      return false if MODIFY_WORDS.any?{ |word| query.match(/#{word}[^\w]/i) || query.match(/^#{word}[^\w]/i) || query.match(/[^\w]#{word}$/i) }
    end
    true
  end

  class << self

    def get(id)
      get_connection(get_configuration(id))
    end

    def get_configuration(id)#todo
      con = ConnectionAttributes.where(id: id).first
      con.attributes.except("_id", "name").symbolize_keys!
    end

    def get_connection(configuration)
      case configuration[:db_type]
        when 'sqlserver'
          Connection::SqlServerConnection.new(configuration)
        when 'progress'
          Connection::ProgressConnection.new(configuration)
        when 'mysql'
          Connection::MysqlConnection.new(configuration)
        else
          raise "Database Connection not yet supported!"
      end
    end

  end

end
