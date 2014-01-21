function relationsController($scope, $http, $rootScope) {
    $scope.connections = []; // any connection object in this Array will be listed in view
    $scope.connection = null;
    $scope.table = null;
    $scope.relationConnection = null;
    $scope.relationTable = null;
    $scope.throughRelationName = null;
    $scope.throughRelation = null;
    $scope.throughRelationId = null;
    $scope.types = [ 'has_many', 'has_many_through' ];
    $scope.comparisonOperators = ['Equal To', 'Greater Than', 'Less Than', 'Like', 'Not Equal To', 'In'];
    $scope.comparisonTypes = ['Column', 'Value'];
    $scope.joinClauses = [ { id: 1 } ];
    $scope.whereClauses = [ { id: 1 } ];


    // connections

    $scope.setThroughRelation = function(){
      $scope.throughRelation = $scope.table.relations.filter(function(relation){
        if(relation.id == $scope.throughRelation.id){
            relation.columns = [];
            $http.get('/connections/' + relation.relationTable.connectionName + '/tables/' + relation.relationTable.schemaName + '/' + relation.relationTable.tableName + '/columns').
                success(function(data, status, headers, config) {
                    data.forEach(function(columnName, idx, arr){
                        relation.columns.push(columnName);
                    });
                }).
                error(function(data, status, headers, config) {
                    // something went wrong
                });
            return true;
        }else{
            return false;
        }
      })[0];
    };

    $scope.addJoinClause = function(){
        $scope.joinClauses.push(new JoinClause);
    };

    $scope.removeJoinClause = function(joinClauseId){
        var reindex = 1;
        $scope.joinClauses = $scope.joinClauses.filter(function(joinClause){
           if(joinClause.id !== joinClauseId){
               joinClause.id = reindex;
               reindex++;
               return true;
           }else{
               return false;
           }
        });
    };

    $scope.removeWhereClause = function(whereClauseId){
        var reindex = 1;
        $scope.whereClauses = $scope.whereClauses.filter(function(whereClause){
            if(whereClause.id !== whereClauseId){
                whereClause.id = reindex;
                reindex++;
                return true;
            }else{
                return false;
            }
        });
    };

    $scope.addWhereClause = function(){
        $scope.whereClauses.push(new WhereClause);
    };

    $scope.setConnection = function(){
      $scope.connection = $scope.getConnection($scope.connection);
    };

    $scope.setRelationConnection = function(){
        $scope.relationConnection = $scope.getConnection($scope.relationConnection);
    };

    $scope.setTable = function(){
      $scope.table = new Table($scope.connection.name, $scope.table, true);
    };

    $scope.getRelations = function(table){
        $http.get('/connections/' + $scope.connection.name + '/tables/' + table.schemaName + '/' + table.tableName + '/relations').
            success(function(data, status, headers, config) {
                data.forEach(function(relation, idx, arr){
                    table.relations.push(new Relation(relation));
                });
            }).
            error(function(data, status, headers, config) {
                // something went wrong
            });
    };

    $scope.setRelationTable = function(){
        $scope.relationTable = new Table($scope.relationConnection.name, $scope.relationTable, true);
    };

    $scope.getConnections = function(){
        $http.get('/connections').
            success(function(data, status, headers, config) {
                data.forEach(function(connectionName, idx, arr){
                    $scope.connections.push(new Connection(connectionName));
                });
            }).
            error(function(data, status, headers, config) {
                // something went wrong
            });
    };

    $scope.getConnection = function(connectionName){
        return _.find($scope.connections, function(connection){
            return connection.name == connectionName;
        });
    };

    $scope.getTables = function(connection){
        connection.tables = [];
        $http.get('/connections/' + connection.name + '/tables').
            success(function(data, status, headers, config) {
                data.forEach(function(tableName, idx, arr){
                    connection.tables.push(new Table($scope.connection, tableName, false));
                });
            }).
            error(function(data, status, headers, config) {
                // something went wrong
            });
    };

    // general functions

    $scope.createConnectionWindow = function(connectionName, tableName){
        $rootScope.$emit('addConnectionWindow', { connectionName: connectionName, tableName: tableName });
    };

    $scope.toggleDisplay = function(connectionName){
        var connection = $scope.getConnection(connectionName);
        connection.display = connection.display !== true;
    };

    $scope.displayAllConnections = function(){
        $scope.connections.forEach(function(connection, idx, arr){
            console.log(connection);
            connection.display = true;
        });
    };

    $scope.getColumns = function(table, connectionName){
        $http.get('/connections/' + connectionName + '/tables/' + table.schemaName + '/' + table.tableName + '/columns').
            success(function(data, status, headers, config) {
                data.forEach(function(columnName, idx, arr){
                    table.columns.push(columnName);
                });
            }).
            error(function(data, status, headers, config) {
                // something went wrong
        });
    };

    // objects

    var Connection = function(connectionName){
        this.name = connectionName;
        $scope.getTables(this);
    };

    var Table = function(connectionName, tableName, withDetail){
        this.connectionName = connectionName;
        var table_name_parts = tableName.split('.');
        if(table_name_parts[1] !== undefined){
            this.schemaName = table_name_parts[0];
            this.tableName = table_name_parts[1];
            this.fullTableName = table_name_parts[0] + '.' + table_name_parts[1];
        }else{
            this.schemaName = '';
            this.tableName = table_name_parts[0];
            this.fullTableName = table_name_parts[0];
        }
        if(withDetail==true){
            this.columns = [];
            $scope.getColumns(this, connectionName);
            $scope.getRelations(this);

        }else{
            this.columns = [];
        }
        this.relations = [];
    };

    var JoinClause = function(){
      this.id = $scope.joinClauses.length+1;

    };

    var WhereClause = function(){
        this.id = ($scope.whereClauses.length+1);
    };

    var Relation = function(relation){
        this.id = relation.id;
        this.name = relation.relation_name;
        this.connectionName = relation.connection_name;
        this.relationTable = new Table(relation.relation_connection_name, relation.relation_table_name, false);
    }

}

