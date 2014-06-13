class JdbcConnection
  attr_accessor :database

  def initialize(database)
    @database = database
  end

  def establish_connection
    @connection = java.sql.DriverManager.getConnection(@database.url, @database.username, @database.password)
  end

  def close_connection
    @connection.close if @connection.present?
  end

  def test_connection
    begin
      establish_connection
    ensure
      close_connection
    end
  end

end