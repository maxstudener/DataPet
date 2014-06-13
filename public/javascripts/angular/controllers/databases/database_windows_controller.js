function databaseWindowsController($scope, $rootScope, httpServices) {

    $scope.databaseWindows = [];
    $scope.currentRowId = null; // holds the last selected rowId in order to lookup data before fetching a relation


    // DatabaseWindows


    $rootScope.$on('addDatabaseWindow', function (event, data) {
        var databaseWindow = $scope.createDatabaseWindow(data['database'], data['tableName']);
        $(window).trigger('resize');
        $scope.submitQuery(databaseWindow.id, '');
    });

    $scope.createDatabaseWindow = function (databaseObject, tableName) {
        var databaseWindow = new DatabaseWindow(databaseObject, tableName);
        $scope.databaseWindows.push(databaseWindow);
        $scope.showDatabaseWindow(databaseWindow.id);
        return databaseWindow;
    };

    $scope.showDatabaseWindow = function (databaseWindowId) {
        $scope.databaseWindows.forEach(function (databaseWindow) {
            if (databaseWindowId == databaseWindow.id) {
                databaseWindow.active = 'active';
            } else {
                databaseWindow.active = '';
            }

            $(window).trigger('resize');
        });
    };

    $scope.getDatabaseWindow = function (databaseWindowId) {
        return $scope.databaseWindows.filter(function (databaseWindow) {
            return databaseWindow.id == databaseWindowId;
        })[0];
    };


    $scope.closeDatabaseWindow = function (databaseWindowId) {
        var databaseWindow = $scope.getDatabaseWindow(databaseWindowId);
        var activateLastTab = databaseWindow.active === 'active';

        $scope.databaseWindows = $scope.databaseWindows.filter(function (databaseWindow) {
            return databaseWindow.id != databaseWindowId;
        });

        if (activateLastTab) {
            var newActiveWindow = $scope.databaseWindows[$scope.databaseWindows.length - 1];
            if (newActiveWindow !== undefined) {
                newActiveWindow.active = 'active';
            }
            $(window).trigger('resize');
        }
    };

    $scope.submitQuery = function (databaseWindowId, sqlQuery) {
        var spinner = startSpinner(databaseWindowId);
        var databaseWindow = $scope.getDatabaseWindow(databaseWindowId);

        databaseWindow.reset(); // clear the columns, rows, relations, and state

        var postData = {
            query_data: {
                schema_name: databaseWindow.schemaName,
                table_name: databaseWindow.tableName,
                query: sqlQuery,
                max_rows: databaseWindow.maxRows
            }
        };

        httpServices.post(postData, '/databases/' + databaseWindow.database_id + '/tables/query', function (success, data) {
            if (success) {
                $scope.fillTable(databaseWindow, data);
                spinner.stop();
            } else {
                spinner.stop();
            }
        });
    };

    $scope.fillTable = function (databaseWindow, data) {
        var def = [];
        if (data.rows.length > 0) {

            // set the state to truncated if the result set is greater than or equal to the maxRows
            if (data.rows.length >= databaseWindow.maxRows) {
                databaseWindow.state = 'truncated';
                $rootScope.$emit('sendNoticeToUser', { text: 'The result set may be limited by max rows.', class: 'alert-warning' });
            }

            data.columns.forEach(function (column) {
                databaseWindow.columns.push(new Column(column));
            });

            data.rows.forEach(function (row, idx) {
                // rows change the size of the table columns so we must defer calling fixTableHeaders() until all the data is loaded
                def.push($scope.addRow(databaseWindow, row, idx));
            });

            data.relations.forEach(function (relation) {
                databaseWindow.relations.push(new Relation(relation.name, relation));
            });

        } else {
            $rootScope.$emit('sendNoticeToUser', { text: 'The query returned no data.', class: 'alert-info' });
        }

        $.when.apply($, def).done(function () {
            setTimeout(function () {
                $(window).trigger('resize');
                fixTableHeaders();
            }, 0);
        });
    };

    $scope.addRow = function (databaseWindow, row, idx) {
        var dfd = $.Deferred();
        databaseWindow.rows.push(new Row(row, idx));
        dfd.resolve();
        return dfd.promise();
    };


    // DatabaseWindows for Relations


    $scope.newRelationWindow = function (databaseWindowId, relationName) {
        $scope.closeRelationMenu(databaseWindowId); // close the pop-up menu
        var databaseWindow = $scope.getDatabaseWindow(databaseWindowId);
        var relation = databaseWindow.relations.filter(function (relation) {
            return relation.name == relationName;
        })[0];

        var relationDatabaseObject = {
            name: databaseWindow.title,
            id: relation.relationAttributes.to_database_id
        };

        var row = databaseWindow.rows[$scope.currentRowId];


        var newDatabaseWindow = $scope.createDatabaseWindow(relationDatabaseObject, relation.relationAttributes.to_table_name);
        $scope.getRelationData(newDatabaseWindow, databaseWindow, relation.id, row.columns);
    };

    $scope.getRelationData = function (databaseWindow, oldDatabaseWindow, relationId, rowData) {
        databaseWindow.reset();
        databaseWindow.maxRows = oldDatabaseWindow.maxRows;

        var postData = {
            query_data: {
                schema_name: databaseWindow.schemaName,
                table_name: databaseWindow.tableName,
                row_data: rowData,
                max_rows: databaseWindow.maxRows
            }
        };

        httpServices.post(postData, '/database_relations/' + relationId + '/query', function (success, data) {
            if (success) {
                $scope.fillTable(databaseWindow, data);
                databaseWindow.currentSqlQuery = 'WHERE' + data.query.split(' WHERE ')[1]; // hack off everything before WHERE clause
                databaseWindow.currentSqlQuery = databaseWindow.currentSqlQuery.split(' LIMIT ')[0]; // hack of LIMIT statement if it exists
            }
        });
    };


    // Relations Menu


    $scope.showRelationMenu = function (databaseWindowId, rowId, $event) {
        databaseWindow = $scope.getDatabaseWindow(databaseWindowId);
        if (databaseWindow.relations.length > 0) {
            $scope.setCurrentRowId(rowId);
            var menu = $('#' + databaseWindowId + '_relations');
            menu.css('left', '15px');
            menu.css('top', ($event.clientY - $('#top_navigation_bar').height()) + 'px');
            menu.show();
        }
    };

    $scope.closeRelationMenu = function (databaseWindowId) {
        $('#' + databaseWindowId + '_relations').hide();
    };

    // only keeping track of the rowId, regardless of which connectionWindow it was in
    // the user can only have one active window at a time
    $scope.setCurrentRowId = function (rowId) {
        $scope.currentRowId = rowId;
    };


    // Objects


    var DatabaseWindow = function (database, fullTableName) {
        this.database_id = database.id;
        this.generateId();
        this.generateTableParts(fullTableName);

        // attributes not cleared between queries
        this.title = database.name + ' / ' + fullTableName; // displayed in tab
        this.active = 'active'; // used as flag for the current connectionWindow via CSS class
        this.maxRows = 50; // maximium result set size for this connectionWindow
        this.currentSqlQuery = ''; // displayed in the form for this connectionWindow

        // used for generating a link
        this.databaseName = database.name;
        this.fullTableName = fullTableName;

        // attributes cleared between queries with reset()
        this.state = '';
        this.columns = [];
        this.rows = [];
        this.relations = [];
    };

    // clears the current states and data for the connectionWindow
    DatabaseWindow.prototype.reset = function () {
        this.state = '';
        this.relations = [];
        this.rows = [];
        this.columns = [];
    };

    // split fullTableName into schema and table parts
    DatabaseWindow.prototype.generateTableParts = function (fullTableName) {
        var tableNameParts = fullTableName.split('.');
        if (tableNameParts[1] !== undefined) {
            this.schemaName = tableNameParts[0];
            this.tableName = tableNameParts[1];
        } else {
            this.schemaName = '';
            this.tableName = tableNameParts[0];
        }
    };

    // generate a unique id to reference this table, database id doesn't handle multiple instances of the same window
    DatabaseWindow.prototype.generateId = function () {
        var now = new Date();
        this.id = now.getDay().toString() + now.getHours().toString() + now.getMinutes().toString() + now.getMilliseconds().toString();
    };

    var Column = function (columnName) {
        this.name = columnName;
    };

    var Row = function (rowData, idx) {
        var row = this;
        row.id = idx;
        row.columns = [];

        Object.keys(rowData).forEach(function (column_name) {
            row.columns.push({
                column: column_name,
                value: rowData[column_name]
            });
        });
    };

    var Relation = function (relationName, relationAttributes) {
        this.id = relationAttributes.id;
        this.name = relationName;
        this.relationAttributes = relationAttributes;
    };


    // Display Row Details


    $scope.rowDetail = { columns: [], data: {}, show: false, sort: 'none' };

    $scope.displayRowDetail = function (data, columns) {
        $scope.rowDetail.show = true;
        $scope.rowDetail.columns = columns;
        columns.forEach(function (column, idx, arr) {
            $scope.rowDetail.data[column.name] = data[idx].value;
        });

    };

    $scope.closeRowDetail = function () {
        $scope.rowDetail = { columns: [], data: {}, show: false };

    };

    $scope.sortRowDetail = function () {
        var sorted = $scope.rowDetail.sort;
        if (sorted == 'none' || sorted == 'desc') {
            $scope.rowDetail.columns.sort(function (a, b) {
                return a.name.localeCompare(b.name)
            });
            $scope.rowDetail.sort = 'asc';
        } else {
            $scope.rowDetail.columns.sort(function (a, b) {
                return b.name.localeCompare(a.name)
            });
            $scope.rowDetail.sort = 'desc';
        }
    };


    // Link Experiment


    $scope.server = location.host;

    $(function(){

        var paramsHash = {};
        var queryString = location.search;
        var querySplit = queryString.split('?');

        for(var x=0;x<querySplit.length;x++){
            try{
                var paramPieces = querySplit[x].split(':');
                if(paramPieces[0] !== '' && paramPieces[1] != ''){
                    paramsHash[paramPieces[0]] = paramPieces[1];
                }
            }
            catch(err){
                console.log(err);
            }
        }

        var database = {};
        database.id = decodeURI(paramsHash['database_id']);
        database.name = decodeURI(paramsHash['database_name']);
        var tableName = decodeURI(paramsHash['full_table_name']);
        var query = decodeURI(paramsHash['query']).split(' LIMIT ')[0];

        if(query === 'undefined'){
            query = '';
        }

        if(database._id !== 'undefined' && database.name !== 'undefined' && tableName !== 'undefined' ){
            var databaseWindow = $scope.createDatabaseWindow(database, tableName);
            databaseWindow.currentSqlQuery = query;
            $(window).trigger('resize');
            $scope.submitQuery(databaseWindow.id, query);
        }
    });

}

