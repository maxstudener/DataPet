function connectionWindowsController($scope, $http, $rootScope) {
    $scope.sqlWindows = [];
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

    $scope.getSqlWindow = function(connectionWindowId){
        return $scope.sqlWindows.filter(function(connectionWindow){
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
            var newActiveWindow = $scope.connectionWindows[$scope.connectionWindows.length - 1];
            if(newActiveWindow !== undefined){
                newActiveWindow.active = 'active';
            }
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

        $http.post(url, { sqlQuery: sqlQuery, maxRows: connectionWindow.maxRows })
            .success(function(data) {
                $scope.fillTable(connectionWindow, data);
                spinner.stop();
            })
            .error(function() {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
                spinner.stop();
            });
    };

    $scope.submitSqlWindowQuery = function(connectionWindowId, sqlQuery){
        var spinner = startSpinner(connectionWindowId);
        var connectionWindow = $scope.getSqlWindow(connectionWindowId);
        var url = '/connections/' + connectionWindow.connectionId + '/query';

        connectionWindow.reset(); // clear the columns, rows, relations, and state of the connectionWindow

        $http.post(url, { sqlQuery: sqlQuery, maxRows: connectionWindow.maxRows })
            .success(function(data) {
                $scope.fillTable(connectionWindow, data);
                spinner.stop();
            })
            .error(function() {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
                spinner.stop();
            });
    };

    $scope.fillTable = function(connectionWindow, data){
        var def = [];
        if(data['rows'].length > 0){

            // set the state to truncated if the result set is greater than or equal to the maxRows for the connectionWindow
            if(data['rows'].length >= connectionWindow.maxRows){
                connectionWindow.state = 'truncated';
                $rootScope.$emit('sendNoticeToUser', { text: 'The result set may be limited by max rows.', class: 'alert-warning' });

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
            $rootScope.$emit('sendNoticeToUser', { text: 'The query returned no data.', class: 'alert-info' });
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
        $http.post(url, { rowData: rowData, maxRows: connectionWindow.maxRows })
            .success(function(data) {
                $scope.fillTable(connectionWindow, data);
                connectionWindow.currentSqlQuery = 'WHERE' + data['query'].split(' WHERE ')[1];
                connectionWindow.currentSqlQuery = connectionWindow.currentSqlQuery.split(' LIMIT ')[0];
            })
            .error(function() {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });
    };


    // ********** end of relations aka: connectionWindows ********** //


    // ********** start of relation menus ********** //


    $scope.showRelationMenu = function(connectionWindowId, rowId, $event){
        connectionWindow = $scope.getConnectionWindow(connectionWindowId);
        if(connectionWindow.relations.length > 0){
            $scope.setCurrentRowId(rowId);
            var menu = $('#' + connectionWindowId + '_relations');
            menu.css('left', '15px' );
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

    $rootScope.$on('addSqlWindow', function(event, data){
        $scope.sqlWindows = [];
        var connectionObject = { '_id': data['connectionId'], name: 'RAW' }
        var sqlWindow = new ConnectionWindow(connectionObject, 'SQL');
        $scope.sqlWindows.push(sqlWindow);
        $scope.submitSqlWindowQuery(sqlWindow.id, data['sqlQuery']);
        $(window).trigger('resize');
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

        this.connectionName = connectionObject.name;
        this.fullTableName = fullTableName;

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


    // this is an experiment to generate a link to open DataPet, open a connectionWindow, and query a table

    $scope.server = location.host;

    $(function(){
        // In order to create something meaningful, each of the following must be present:
        //   connection_id
        //   connection_name
        //   full_table_name
        //   query

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

        var connection = {};
        connection._id = decodeURI(paramsHash['connection_id']);
        connection.name = decodeURI(paramsHash['connection_name']);
        var tableName = decodeURI(paramsHash['full_table_name']);
        var query = decodeURI(paramsHash['query']).split(' LIMIT ')[0];

        if(query === 'undefined'){
            query = '';
        }

        if(connection._id !== 'undefined' && connection.name !== 'undefined' && tableName !== 'undefined' ){
            var connectionWindow = $scope.createConnectionWindow(connection, tableName);
            connectionWindow.currentSqlQuery = query;
            $(window).trigger('resize');
            $scope.submitQuery(connectionWindow.id, query);
        }
    });


    // open row detail when user double clicks a row

    $scope.rowDetail = { columns: [], data: {}, show: false, sort: 'none' };

    $scope.displayRowDetail = function(data, columns){
        $scope.rowDetail.show = true;
        $scope.rowDetail.columns = columns;
        columns.forEach(function(column, idx, arr){
           $scope.rowDetail.data[column.name] = data[idx].value;
        });

    };

    $scope.closeRowDetail = function(){
        $scope.rowDetail = { columns: [], data: {}, show: false };

    };

    $scope.sortRowDetail = function(){
        var sorted = $scope.rowDetail.sort;
        if(sorted == 'none' || sorted == 'desc'){
            $scope.rowDetail.columns.sort(function(a, b){ return a.name.localeCompare(b.name) });
            $scope.rowDetail.sort = 'asc';
        }else{
            $scope.rowDetail.columns.sort(function(a, b){ return b.name.localeCompare(a.name) });
            $scope.rowDetail.sort = 'desc';
        }
    };
}

