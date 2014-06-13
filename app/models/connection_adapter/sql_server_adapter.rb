module ConnectionAdapter

  module SqlServerAdapter

    USE_TOP   = true

    USE_LIMIT = false

    TIC       = %q|"|

    TABLE_FETCH_SQL = %Q|SELECT SCHEMA_NAME(schema_id)+'.'+name AS "name" FROM sys.tables;|

    COLUMN_FETCH_SQL = %Q|SELECT COLUMN_NAME AS "name" FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '?' AND TABLE_SCHEMA = '?';|

  end

end