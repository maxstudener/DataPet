module ConnectionAdapter

  module ProgressAdapter

    USE_TOP   = true

    USE_LIMIT = false

    TIC       = %q|"|

    TABLE_FETCH_SQL = %Q|SELECT OWNER+'.'+TBL AS "name" FROM sysprogress.SYSTABLES_FULL|

    COLUMN_FETCH_SQL = %Q|SELECT col AS "name" FROM sysprogress.SYSCOLUMNS where TBL = '?'|

  end

end