function connectionWindowsController($scope, $http, $rootScope, $modal) {
    $scope.connectionWindows = []; // any connectionWindow object in this Array will be shown as a tab in view
    $scope.currentRowId = null; // holds the last selected rowId in order to lookup data before fetching a relation

    // connectionWindows

    $scope.createConnectionWindow = function(connection, tableName){
        var connectionWindow = new ConnectionWindow(connection, tableName);
        $scope.connectionWindows.push(connectionWindow);
        $scope.showTab(connectionWindow.id);
        return connectionWindow;
    };

    $scope.getConnectionWindow = function(connectionWindowId){
        return _.find($scope.connectionWindows, function(connectionWindow){
            return connectionWindow.id == connectionWindowId;
        });
    };

    $scope.closeConnectionWindow = function(connectionWindowId){
        $scope.connectionWindows = _.reject($scope.connectionWindows, function(connectionWindow){
           return connectionWindow.id == connectionWindowId;
        });
    };

    $scope.submitQuery = function(connectionWindowId, sqlQuery){
        var connectionWindow = $scope.getConnectionWindow(connectionWindowId);
        connectionWindow.badQuery = false;
        connectionWindow.noData = false;
        connectionWindow.relations = [];
        connectionWindow.rows = [];
        connectionWindow.columns = [];
        console.log('fap', connectionWindowId)
        $http.post('/connections/' + connectionWindow._id + '/tables/' + connectionWindow.schemaName + '/' + connectionWindow.tableName + '/query', { sql: sqlQuery, limit: connectionWindow.limit }).
            success(function(data, status, headers, config) {
                if(data['rows'].length > 0){
                    data['rows'].forEach(function(row, idx, arr){
                        connectionWindow.rows.push(new Row(row, idx))
                    });
                    data['columns'].forEach(function(column, idx, arr){
                        connectionWindow.columns.push(new Column(column));
                    });
                    data['relations'].forEach(function(relation, idx, arr){
                        connectionWindow.relations.push(new Relation(relation.relation_name, relation));
                    });
                }else{
                    connectionWindow.noData = true;
                }
            }).
            error(function(data, status, headers, config) {
                connectionWindow.badQuery = true;
                // something went wrong
            });
    };

    // relations aka: connectionWindows

    $scope.newRelationWindow = function(connectionWindow, relationName){
        console.log('relation window fap',connectionWindow, relationName)
        $scope.closeRelationMenu(connectionWindow.id);

        var relation = _.find(connectionWindow.relations, function(relation){
            return relation.relationAttributes.relation_name == relationName;
        });
        console.log('relation?', relation)

        var relationConnectionId = relation.relationAttributes.to_connection_id;

        $scope.getConnection(relationConnectionId, function(connection){

          var row = connectionWindow.rows[$scope.currentRowId];
          var rowData = {};
          _.each(row.rowData, function(data){
              rowData[connectionWindow.columns[data.id].name.toLowerCase()] = data.value
          });
          console.log('to table name?', relation.relationAttributes)
          var newConnectionWindow = $scope.createConnectionWindow(connection, relation.relationAttributes.to_table_name);
          $scope.getRelationData(newConnectionWindow, connectionWindow, relationName, rowData);

        });

    };

    $scope.getConnection = function(id, cb){
      if(id == undefined){
        return cb(connectionWindow.connection);
      }
      $http.get('/connections/' + id + '.json').
        success(function(data){
          cb(data);
        }).
        error(function(){
          cb(connectionWindow.connection);
        });
    };

    $scope.getRelationData = function(connectionWindow, oldConnectionWindow, relationName, rowData){
        connectionWindow.badQuery = false;
        connectionWindow.noData = false;
        connectionWindow.relations = [];
        connectionWindow.rows = [];
        connectionWindow.columns = [];
        $http.post('/connections/' + oldConnectionWindow._id + '/tables/' + oldConnectionWindow.schemaName + '/' + oldConnectionWindow.tableName + '/relations/' + relationName + '/query', { rowData: rowData }).
            success(function(data, status, headers, config) {
                if(data['rows'].length > 0){
                    data['rows'].forEach(function(row, idx, arr){
                        connectionWindow.rows.push(new Row(row, idx));
                    });
                    data['columns'].forEach(function(column, idx, arr){
                        connectionWindow.columns.push(new Column(column));
                    });
                    data['relations'].forEach(function(relation, idx, arr){
                        connectionWindow.relations.push(new Relation(relation.relation_name, relation));
                    });
                }else{
                    connectionWindow.noData = true;
                }
                connectionWindow.currentSqlQuery = 'WHERE' + data['query'].split('WHERE')[1];
            }).
            error(function(data, status, headers, config) {
                connectionWindow.badQuery = true;
                // something went wrong
            });
    };

    // relationMenus

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

    // general functions

    // only keeping track of the rowId, regardless of which connectionWindow it was in
    // the user can only have one active window at a time
    $scope.setCurrentRowId = function(rowId){
        $scope.currentRowId = rowId;
    };

    $rootScope.$on('addConnectionWindow', function(event, data){

        var connectionWindow = $scope.createConnectionWindow(data['connection'], data['tableName']);
        console.log('super fap', connectionWindow)
        $scope.submitQuery(connectionWindow.id, 'Select TOP ' + connectionWindow.limit + ' * FROM ' + '"' + connectionWindow.schemaName + '"."' + connectionWindow.tableName + '"');
    });

    $scope.showTab = function(connectionWindowId){
        _.each($scope.connectionWindows, function(connectionWindow){
            if(connectionWindowId == connectionWindow.id){
                connectionWindow.active = 'active';
            }else{
                connectionWindow.active = '';
            }
        });
    };

    // objects

    var ConnectionWindow = function(connection, tableName){
        // split up the tableName
        console.log('creat window fap', connection, tableName)
        var table_name_parts = tableName.split('.');
        if(table_name_parts[1] !== undefined){
            this.schemaName = table_name_parts[0];
            this.tableName = table_name_parts[1];
        }else{
            this.schemaName = '';
            this.tableName = table_name_parts[0];
        }

        var now = new Date();
        this._id = connection._id;
        this.connection = connection;
        this.id = now.getDay().toString() + now.getHours().toString() + now.getMinutes().toString() + now.getMilliseconds().toString();
        this.title = connection.name + ' / ' + tableName;
        this.connectionName = connection.name;
        this.active = 'active'; // used as flag for ng-show in view
        this.rows = [];
        this.columns = [];
        this.relations = [];
        this.currentSqlQuery = ''; // displayed in form for connectionWindow
        this.limit = 50;
    };

    var Column = function(columnName){
        this.name = columnName;
        this.width = 0;
    };

    var Row = function(rowData, idx){
        this.id = idx;
        var row = this;
        this.rowData = [];
        // values need and index for ng-repeat in view
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

