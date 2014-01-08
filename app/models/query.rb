class Query

  def initialize(table_name, sql, limit = 50)
    if sql.match(/^SELECT/i)
      @sql = sql
    else
      @sql = "SELECT TOP #{limit} * FROM #{table_name} "
      @sql += "WHERE " unless sql.match(/^WHERE/i)
      @sql += sql
    end
    @sql.force_encoding('utf-8')
  end

  def sql
    @sql
  end

end