function connectionWindowsController($scope, $http, $rootScope, $modal) {
    $scope.connectionWindows = []; // any connectionWindow object in this Array will be shown as a tab in view
    $scope.currentRowId = null; // holds the last selected rowId in order to lookup data before fetching a relation


    // ********** start of connectionWindows ********** //


    $scope.createConnectionWindow = function(connectionObject, tableName){
        var connectionWindow = new ConnectionWindow(connectionObject, tableName);
        $scope.connectionWindows.push(connectionWindow);
        $scope.showConnectionWindow(connectionWindow.id);
        return connectionWindow;
    };

    $scope.getConnectionWindow = function(connectionWindowId){
        return $scope.connectionWindows.filter(function(connectionWindow){
            return connectionWindow.id == connectionWindowId;
        })[0];
    };

    $scope.closeConnectionWindow = function(connectionWindowId){
        var activateLastTab = false;
        var connectionWindow = $scope.getConnectionWindow(connectionWindowId);
        if(connectionWindow.active === 'active'){
            activateLastTab = true;
        }

        $scope.connectionWindows = $scope.connectionWindows.filter(function(connectionWindow){
            return connectionWindow.id != connectionWindowId;
        });

        if(activateLastTab){
            // activate the last tab available
            $scope.connectionWindows[$scope.connectionWindows.length - 1].active = 'active';
            $(window).trigger('resize');
        }
    };

    $scope.showConnectionWindow = function(connectionWindowId){
        $scope.connectionWindows.forEach(function(connectionWindow){
            if(connectionWindowId == connectionWindow.id){
                connectionWindow.active = 'active'; // show this connectionWindow
            }else{
                connectionWindow.active = ''; // hide this connectionWindow
            }

            // resize the window
            $(window).trigger('resize');
        });
    };


    // ********** end of connectionWindows ********** //


    // ********** start of data operations ********** //


    $scope.submitQuery = function(connectionWindowId, sqlQuery){
        var spinner = startSpinner(connectionWindowId);
        var connectionWindow = $scope.getConnectionWindow(connectionWindowId);
        var url = '/connections/' + connectionWindow.connectionId + '/tables/' + connectionWindow.schemaName + '/' + connectionWindow.tableName + '/query';

        connectionWindow.reset(); // clear the columns, rows, relations, and state of the connectionWindow

        $http.post(url, { sqlQuery: sqlQuery, maxRows: connectionWindow.maxRows }).
            success(function(data) {
                $scope.fillTable(connectionWindow, data);
                spinner.stop();
            }).
            error(function() {
                connectionWindow.state = 'bad_query';
                spinner.stop();
            });
    };

    $scope.fillTable = function(connectionWindow, data){
        var def = [];
        if(data['rows'].length > 0){

            // set the state to truncated if the result set is greater than or equal to the maxRows for the connectionWindow
            if(data['rows'].length >= connectionWindow.maxRows){
                connectionWindow.state = 'truncated';
            }

            data['columns'].forEach(function(column){
                connectionWindow.columns.push(new Column(column));
            });

            data['rows'].forEach(function(row, idx){
                // rows change the size of the table columns so we must defer calling fixTableHeaders() until all the data is loaded
                def.push($scope.addRow(connectionWindow, row, idx));
            });

            data['relations'].forEach(function(relation){
                connectionWindow.relations.push(new Relation(relation.relation_name, relation));
            });

        }else{
            connectionWindow.state = 'no_data';
        }

        $.when.apply($, def).done(function(){
          setTimeout(function(){
              $(window).trigger('resize');
              fixTableHeaders();
          }, 0);
        });
    };

    $scope.addRow = function(connectionWindow, row, idx){
        var dfd = $.Deferred();
        connectionWindow.rows.push(new Row(row, idx));
        dfd.resolve();
        return dfd.promise();
    };


    // ********** start of data operations ********** //


    // ********** start of relations aka: connectionWindows ********** //


    $scope.newRelationWindow = function(connectionWindowId, relationName){
        $scope.closeRelationMenu(connectionWindowId); // close the pop-up menu
        var connectionWindow = $scope.getConnectionWindow(connectionWindowId);
        var relation = connectionWindow.relations.filter(function(relation){
            return relation.name == relationName;
        })[0];

        var relationConnectionObject = {
            name: relation.relationAttributes.to_connection_name,
            '_id': relation.relationAttributes.to_connection_id
        };

        var row = connectionWindow.rows[$scope.currentRowId];
        var rowData = {};

        row.rowData.forEach(function(data){
            rowData[connectionWindow.columns[data.id].name.toLowerCase()] = data.value
        });

        var newConnectionWindow = $scope.createConnectionWindow(relationConnectionObject, relation.relationAttributes.to_table_name);
        $scope.getRelationData(newConnectionWindow, connectionWindow, relationName, rowData);
    };

    $scope.getRelationData = function(connectionWindow, oldConnectionWindow, relationName, rowData){
        connectionWindow.reset();

        var url = '/connections/' + oldConnectionWindow.connectionId + '/tables/' + oldConnectionWindow.schemaName + '/' + oldConnectionWindow.tableName + '/relations/' + relationName + '/query';
        $http.post(url, { rowData: rowData, maxRows: connectionWindow.maxRows }).
            success(function(data) {
                $scope.fillTable(connectionWindow, data);
                connectionWindow.currentSqlQuery = 'WHERE' + data['query'].split('WHERE')[1];
            }).
            error(function() {
                connectionWindow.state = 'bad_query';
            });
    };


    // ********** end of relations aka: connectionWindows ********** //


    // ********** start of relation menus ********** //


    $scope.showRelationMenu = function(connectionWindowId, rowId, $event){
        connectionWindow = $scope.getConnectionWindow(connectionWindowId);
        if(connectionWindow.relations.length > 0){
            $scope.setCurrentRowId(rowId);
            var menu = $('#' + connectionWindowId + '_relations');
            menu.css('left', '0px' );
            menu.css('top', ($event.clientY - $('#top_navigation_bar').height()) + 'px' );
            menu.show();
        }
    };

    $scope.closeRelationMenu = function(connectionWindowId){
        $('#' + connectionWindowId + '_relations').hide();
    };


    // ********** end of relation menus ********** //


    // ********** start of general functions ********** //


    // only keeping track of the rowId, regardless of which connectionWindow it was in
    // the user can only have one active window at a time
    $scope.setCurrentRowId = function(rowId){
        $scope.currentRowId = rowId;
    };

    $rootScope.$on('addConnectionWindow', function(event, data){
        var connectionWindow = $scope.createConnectionWindow(data['connection'], data['tableName']);
        $(window).trigger('resize');
        $scope.submitQuery(connectionWindow.id, '');
    });


    // ********** end of general functions ********** //


    // ********** start of connectionWindow Object ********** //


    var ConnectionWindow = function(connectionObject, fullTableName){
        this.generateId();
        this.generateTableParts(fullTableName);

        // attributes not cleared between queries
        this.connectionId = connectionObject._id;
        this.title = connectionObject.name + ' / ' + fullTableName; // displayed in tab
        this.active = 'active'; // used as flag for the current connectionWindow via CSS class
        this.maxRows = 50; // maximium result set size for this connectionWindow
        this.currentSqlQuery = ''; // displayed in the form for this connectionWindow

        // attributes cleared between queries with reset()
        this.state = '';
        this.columns = [];
        this.rows = [];
        this.relations = [];
    };

    // clears the current states and data for the connectionWindow
    ConnectionWindow.prototype.reset = function(){
        this.state = '';
        this.relations = [];
        this.rows = [];
        this.columns = [];
    };

    // split fullTableName into schema and table parts
    ConnectionWindow.prototype.generateTableParts = function(fullTableName){
        var tableNameParts = fullTableName.split('.');
        if(tableNameParts[1] !== undefined){
            this.schemaName = tableNameParts[0];
            this.tableName = tableNameParts[1];
        }else{
            this.schemaName = '';
            this.tableName = tableNameParts[0];
        }
    };

    // generate a unique id to reference this table, database id doesn't handle multiple instances of the same window
    ConnectionWindow.prototype.generateId = function(){
        var now = new Date();
        this.id = now.getDay().toString() + now.getHours().toString() + now.getMinutes().toString() + now.getMilliseconds().toString();
    };


    // ********** end of connectionWindow Object ********** //


    var Column = function(columnName){
        this.name = columnName;
    };

    var Row = function(rowData, idx){
        this.id = idx;
        var row = this;
        this.rowData = [];

        // without an index ng-repeat fails on duplicate values
        rowData.forEach(function(value, idx, arr){
            row.rowData.push(new Value(value, idx));
        });
    };

    var Value = function(value, idx){
        this.id = idx; // without an index ng-repeat fails on duplicate values
        this.value = value;
    };

    var Relation = function(relationName, relationAttributes){
        this.name = relationName;
        this.relationAttributes = relationAttributes;
    };

}

