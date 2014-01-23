class Connection

  DB_DIRECTORY = Rails.root.join('config', 'DataPet')
  CONNECTIONS_DIRECTORY = Rails.root.join('config', 'DataPet', 'connections')
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

    def check_directory_structure
      Dir.mkdir(DB_DIRECTORY) unless Dir.exists?(DB_DIRECTORY)
      Dir.mkdir(CONNECTIONS_DIRECTORY) unless Dir.exists?(CONNECTIONS_DIRECTORY)
    end

    def all
      Connection.check_directory_structure

      Dir.glob("#{CONNECTIONS_DIRECTORY}/*.yml").inject([]) do |connections, file|
        file_name = file.split('.').first.split('/').last
        connections << file_name
      end
    end

    def get(connection_name)
      get_connection(get_configuration(connection_name))
    end

    def get_configuration(connection_name)
      YAML::load(ERB.new(IO.read("#{CONNECTIONS_DIRECTORY}/#{connection_name}.yml")).result)[connection_name].symbolize_keys!
    end

    def get_connection(configuration)
      case configuration[:db_type]
        when 'sqlserver'
          Connection::SqlServerConnection.new(configuration)
        when 'progress'
          Connection::ProgressConnection.new(configuration)
        else
          # use the default connection class
          Connection.new(configuration) # this class is incomplete and will not work !!!
      end
    end

    def details(connection_name)
      connection = Connection.get(connection_name)
      tables = connection.tables.map do |full_table_name|
        if full_table_name.match(/\./)
          schema_name, table_name = full_table_name.split('.')
        else
          schema_name = ''
          table_name = full_table_name
        end

        { connectionName: connection_name, schemaName: schema_name, tableName: table_name}
      end
      { name: connection_name, tables: tables }
    end

  end

end
