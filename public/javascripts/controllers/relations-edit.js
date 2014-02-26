function relationsController($scope, $http, $rootScope, $log, $location) {
    $scope.message = null;
    $scope.messageClass = 'info';

    $scope.relation = {};
    $scope.columnData = {};
    $scope.relationData = {};
    $scope.throughRelation = {}
    $scope.connection = [];

    $scope.fromConnection = {};
    $scope.toConnection = {};

    $scope.types = [
      { name: 'Has Many', value: 'has_many' },
      { name: 'Has Many Through', value: 'has_many_through' }
    ];

    $scope.comparisonOperators = [
      { name: 'Equal To' },
      { name: 'Greater Than' },
      { name: 'Less Than' },
      { name: 'Like' },
      { name: 'Not Equal To' },
      { name: 'In' }
    ];

    $scope.comparisonTypes = [
      { name: 'Column' },
      { name: 'Value' }
    ];

    $scope.initialize = function () {

      $http.get('/connections.json').
        success(function (data, status, headers, config) {
          $scope.connections = data;

          $scope.connections.forEach(function (connection, idx, arr) {
            $scope.getTables(connection);
          });

          $scope.fromConnection = $scope.connections[0];
          $scope.toConnection = $scope.connections[0];

        }).
        error(function (data, status, headers, config) {
            // something went wrong
        });

      $scope.url = $location.absUrl().replace('/edit', '');

      $http.get($scope.url + '.json').success(function(data){
        $scope.relation = data;
      })
    };


    // connections

    $scope.getTables = function (connection) {
      $http.get('/connections/' + connection._id + '/tables').
        success(function (data, status, headers, config) {
          connection.tables = data;
        }).
        error(function (data, status, headers, config) {
            // something went wrong
        });
    };

    $scope.updateFromConnection = function() {
      $scope.fromConnection = $scope.connections.filter(function(connection){
        return connection._id == $scope.relation.from_connection_id;
      })[0];
    };

    $scope.updateToConnection = function() {
      $scope.toConnection = $scope.connections.filter(function(connection){
        return connection._id == $scope.relation.to_connection_id;
      })[0];
    };

    $scope.changedType = function(){
      if($scope.relation.relation_type == 'has_many_through'){
        $scope.relation.join_clauses = [new JoinClause()];
        $scope.relation.where_clauses = undefined;
      }else{
        $scope.relation.where_clauses = [new WhereClause()];
        $scope.relation.join_clauses = undefined;
      }
    }

    // tables
    $scope.loadColumns = function (id, tableName) {
        var connection = $scope.connections.filter(function(connection){
          return connection._id == id;
        })[0];

        if (id === undefined || tableName == undefined) {
            return 1;
        } else {
            var table = connection.tables.filter(function (table) {
                return table.fullTableName == tableName;
            })[0];

            $http.get('/connections/' + id + '/tables/' + table.schemaName + '/' + table.tableName + '/columns').
              success(function (data, status, headers, config) {
                if ($scope.columnData[id] === undefined) {
                  $scope.columnData[id] = {};
                }
                $scope.columnData[id][tableName] = data;
              }).
              error(function (data, status, headers, config) {
                  // something went wrong
              });
        }
    };

    $scope.loadRelationColumns = function(id){
      $http.get('/relations/' + id + '.json').
        success(function (data, status, headers, config) {
          $scope.throughRelation = data;
          $scope.loadColumns($scope.throughRelation.to_connection_id, $scope.throughRelation.to_table_name);
        }).
        error(function (data, status, headers, config) {
            // something went wrong
        });
    };


    // where clauses


    $scope.currentWhereClauseId = 0;

    $scope.removeWhereClause = function (whereClauseId) {
        $scope.relation.where_clauses = $scope.relation.where_clauses.filter(function (whereClause) {
            return whereClause.id !== whereClauseId;
        });
    };

    $scope.addWhereClause = function () {
        $scope.relation.where_clauses.push(new WhereClause);
    };

    var WhereClause = function () {
      this.id = (++$scope.currentWhereClauseId);
      this.comparison_operator = $scope.comparisonOperators[0].name;
      this.comparison_type = $scope.comparisonTypes[0].name;
    };


    // join clauses


    $scope.currentJoinClauseId = 0;

    $scope.addJoinClause = function () {
      $scope.relation.join_clauses.push(new JoinClause);
    };

    $scope.removeJoinClause = function (joinClauseId) {
      $scope.relation.join_clauses = $scope.relation.join_clauses.filter(function (joinClause) {
          return joinClause.id !== joinClauseId;
      });
    };

    var JoinClause = function () {
      this.id = (++$scope.currentJoinClauseId);
    };


    // relations


    $scope.loadRelations = function (id, tableName) {
        var connection = $scope.connections.filter(function(connection){
          return connection._id == id;
        })[0];

        if (id === undefined || tableName == undefined) {
            return 1;
        } else {
            var table = connection.tables.filter(function (table) {
                return table.fullTableName == tableName;
            })[0];

            $http.get('/connections/' + id + '/tables/' + table.schemaName + '/' + table.tableName + '/relations').
                success(function (data, status, headers, config) {
                    if ($scope.relationData[id] === undefined) {
                        $scope.relationData[id] = {};
                    }
                    $scope.relationData[id][tableName] = data;
                }).
                error(function (data, status, headers, config) {
                    // something went wrong
                });
        }
    };


    // submit


    $scope.createRelation = function () {
      $log.warn($scope.relation);
        $http.post($scope.url, { relation: $scope.relation }).success(function (data, status, headers, config) {
                $log.warn(data);
                $scope.message = 'There relation saved.'
                $scope.messageClass = 'success';
                // $scope.initialize();
            }).
            error(function (data, status, headers, config) {
                $scope.message = 'There was an error saving the relation.'
                $scope.messageClass = 'danger';
                // something went wrong
            });
    }


}