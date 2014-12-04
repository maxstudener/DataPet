function databaseWindowsController($scope, $rootScope, httpServices, $interval) {

    $scope.databaseWindows = [];

    // DatabaseWindows

    $rootScope.$on('addDatabaseWindow', function (event, data) {
        $scope.createDatabaseWindow(data['database'], data['tableName']);
    });

    $scope.createDatabaseWindow = function (databaseObject, tableName, loadRelationDataFunction, relation_id, row) {
        var databaseWindow = new DatabaseWindow(databaseObject, tableName, loadRelationDataFunction, relation_id, row);
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
        }
    };

    $scope.submitQuery = function (databaseWindowId, sqlQuery, databaseWindow, cb) {
        if(!Boolean(cb)){
            cb = function(){};
        }

        if(databaseWindow == undefined){
            databaseWindow = $scope.getDatabaseWindow(databaseWindowId);
            databaseWindow.reset(); // clear the columns, rows, relations, and state
        }

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
                cb();
            } else {
            }
        });
    };

    $scope.fillTable = function (databaseWindow, data) {

        databaseWindow.colHeaders = data.columns;

        databaseWindow.columns = [];
        data.columns.forEach(function (column) {
            databaseWindow.columns.push(new Column(column));
        });

        if (data.rows.length > 0) {

            // set the state to truncated if the result set is greater than or equal to the maxRows
            if (data.rows.length >= databaseWindow.maxRows) {
                databaseWindow.state = 'truncated';
                $rootScope.$emit('sendNoticeToUser', {
                    text: 'The result set may be limited by max rows.',
                    class: 'alert-warning'
                });
            }

            data.relations.forEach(function (relation) {
                databaseWindow.relations.push(new Relation(relation.name, relation));
            });

            databaseWindow.rows = data.rows;

            databaseWindow.gridOptions = {
                data: databaseWindow.rows,
                columnDefs: databaseWindow.columns
            }

        } else {
            $rootScope.$emit('sendNoticeToUser', {text: 'The query returned no data.', class: 'alert-info'});
        }
    };


    // DatabaseWindows for Relations


    $scope.newRelationWindow = function (databaseWindow, relation) {
        var relationDatabaseObject = {
            name: databaseWindow.title,
            id: relation.relationAttributes.to_database_id
        };

        var row = databaseWindow.selectedItem;

        if(row == undefined) {
            $rootScope.$emit('sendNoticeToUser', {text: 'You havent selected a row.', class: 'alert-info'});
            return false;
        }

        $scope.createDatabaseWindow(relationDatabaseObject, relation.relationAttributes.to_table_name, true, relation.id, row);

    };

    $scope.getRelationData = function (databaseWindow, relationId, rowData, cb) {
        databaseWindow.maxRows = 50;

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
                cb();
            }
        });
    };


    // Objects
    var DatabaseWindow = function (database, fullTableName, loadRelationDataFunction, relation_id, row) {

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
        this.selectedItem = undefined;
        var databaseWindow = this;

            databaseWindow.gridOptions = {
                data: [],
                multiSelect: false,
                enableRowHeaderSelection: false,
                enableColumnMenus: false,
                enableGridMenu: true,
                rowTemplate: '<div ng-dblclick="displayRowDetail(databaseWindow.selectedItem)" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;

                    // interval of zero just to allow the directive to have initialized
                    $interval(function () {

                        gridApi.edit.on.beginCellEdit($scope,function(rowEntity, colDef){
                            $scope.displayRowDetail(databaseWindow.selectedItem);
                        });

                        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                            databaseWindow.selectedItem = row.entity;
                        });

                        gridApi.core.addToGridMenu(gridApi.grid, [{
                                'title': 'View Details',
                                'action': function ($event) {
                                    $scope.displayRowDetail(databaseWindow.selectedItem);
                                }
                            }]
                        );

                        var relation_drop_down = function(){
                            databaseWindow.relations.forEach(function (relation) {
                                gridApi.core.addToGridMenu(gridApi.grid, [{
                                    'title': relation.name,
                                    'action': function ($event) {
                                        $scope.newRelationWindow(databaseWindow, relation);
                                    }
                                }]);
                            });
                            window.dispatchEvent(new Event('resize'));
                        };

                        if(loadRelationDataFunction) {
                            $scope.getRelationData(databaseWindow, relation_id, row, relation_drop_down);
                        }else{
                            $scope.submitQuery(this.id, '', databaseWindow, relation_drop_down);
                        }



                    }, 0, 1);
                }
            };

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
        this.field = columnName.toLowerCase();
        this.name = columnName;
        this.minWidth = 150;
    };

    var Row = function (rowData, idx) {
        var row = this;
        row.id = idx;
        row.data = {};

        Object.keys(rowData).forEach(function (column_name) {
            row.data[column_name] = rowData[column_name];
        });
    };

    var Relation = function (relationName, relationAttributes) {
        this.id = relationAttributes.id;
        this.name = relationName;
        this.relationAttributes = relationAttributes;
    };


    // Display Row Details


    $scope.rowDetail = {columns: [], data: {}, show: false, sort: 'none'};

    $scope.displayRowDetail = function (rowData) {
        $scope.rowDetail.show = true;
        $scope.rowDetail.data = rowData;
    };

    $scope.closeRowDetail = function () {
        $scope.rowDetail = {columns: [], data: {}, show: false};
    };


    // Link Experiment


    $scope.server = location.host;

    $(function () {

        var paramsHash = {};
        var queryString = location.search;
        var querySplit = queryString.split('?');

        for (var x = 0; x < querySplit.length; x++) {
            try {
                var paramPieces = querySplit[x].split(':');
                if (paramPieces[0] !== '' && paramPieces[1] != '') {
                    paramsHash[paramPieces[0]] = paramPieces[1];
                }
            }
            catch (err) {
                console.log(err);
            }
        }

        var database = {};
        database.id = decodeURI(paramsHash['database_id']);
        database.name = decodeURI(paramsHash['database_name']);
        var tableName = decodeURI(paramsHash['full_table_name']);
        var query = decodeURI(paramsHash['query']).split(' LIMIT ')[0];

        if (query === 'undefined') {
            query = '';
        }

        if (database._id !== 'undefined' && database.name !== 'undefined' && tableName !== 'undefined') {
            var databaseWindow = $scope.createDatabaseWindow(database, tableName);
            databaseWindow.currentSqlQuery = query;
            $(window).trigger('resize');
            $scope.submitQuery(databaseWindow.id, query);
        }
    });

}

