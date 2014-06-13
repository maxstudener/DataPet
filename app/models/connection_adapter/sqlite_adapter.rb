module ConnectionAdapter

  module SqliteAdapter

    USE_TOP   = false

    USE_LIMIT = true

    TIC       = %q|"|

    TABLE_FETCH_SQL = %Q|SELECT tbl_name AS "name" FROM sqlite_master WHERE type='table';|

    COLUMN_FETCH_SQL = %Q|PRAGMA table_info(?);|



  end

end