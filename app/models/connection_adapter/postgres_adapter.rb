module ConnectionAdapter

  module PostgresAdapter

    USE_TOP   = false

    USE_LIMIT = true

    TIC       = %q|"|

    TABLE_FETCH_SQL = %Q|SELECT CONCAT(table_schema, '.', table_name) AS "name" FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY "name";|

    COLUMN_FETCH_SQL = %Q|SELECT column_name AS "name" FROM information_schema.columns WHERE TABLE_NAME = '?' AND TABLE_SCHEMA = '?';|

  end

end