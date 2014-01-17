class Query

  def initialize(table_name, sql, limit = 50)
    if sql.match(/^SELECT/i)
      @sql = sql
    else
      @sql = "SELECT TOP #{limit} * FROM \"#{Query.quote_table(table_name)}\""
      @sql += "WHERE " unless sql.match(/^WHERE/i) || sql.match(/^ORDER\s{1}BY/i)
      @sql += sql
    end
    @sql.force_encoding('utf-8')
  end

  def sql
    @sql
  end

  def self.quote_table(table_name)
    table_name.gsub!('"', '')
    "#{table_name.split('.').join('"."')}"
  end

  def self.unquote_table(table_name)
    table_name.gsub('"', '')
  end

end