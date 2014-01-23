function relationsController($scope, $http, $rootScope) {
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


        $scope.columnData = {};
        $scope.relationData = {};

        $scope.testSomething = function () {
            console.log($scope.relation);
        };

        $scope.initialize = function () {
            $scope.getConnections(function (data) {
                $scope.connections = data; // for drop downs
                $scope.connectionObjects = {}; // for connection details

                // the relation object to be saved
                $scope.relation = {
                    connectionName: data[0].name,
                    relationConnectionName: data[0].name,
                    relationType: $scope.types[0].value,
                    whereClauses: [ new WhereClause() ],
                    joinClauses: [ new JoinClause() ]

                };

                // build up the connection objects
                data.forEach(function (connection, idx, arr) {
                    $scope.connectionObjects[connection.name] = new Connection(connection.name);
                });
            });
        };


        // connections


        $scope.getConnections = function (cb) {
            $http.get('/connections').
                success(function (data, status, headers, config) {
                    cb(data);
                }).
                error(function (data, status, headers, config) {
                    // something went wrong
                });
        };

        var Connection = function (connectionName) {
            this.name = connectionName;
            this.tables = [];
            this.getTables(this);
        };

        Connection.prototype.getTables = function (connection) {
            $http.get('/connections/' + connection.name + '/tables').
                success(function (data, status, headers, config) {
                    connection.tables = data;
                }).
                error(function (data, status, headers, config) {
                    // something went wrong
                });
        };


        // tables


        $scope.loadColumns = function (connectionName, tableName) {
            if (connectionName === undefined || tableName == undefined) {
                return 1;
            } else {
                var table = $scope.connectionObjects[connectionName].tables.filter(function (table) {
                    return table.fullTableName == tableName;
                })[0];

                $http.get('/connections/' + connectionName + '/tables/' + table.schemaName + '/' + table.tableName + '/columns').
                    success(function (data, status, headers, config) {
                        if ($scope.columnData[connectionName] === undefined) {
                            $scope.columnData[connectionName] = {};
                        }
                        $scope.columnData[connectionName][tableName] = data;
                    }).
                    error(function (data, status, headers, config) {
                        // something went wrong
                    });
            }
        };


        // where clauses


        $scope.currentWhereClauseId = 0;

        $scope.removeWhereClause = function (whereClauseId) {
            $scope.relation.whereClauses = $scope.relation.whereClauses.filter(function (whereClause) {
                return whereClause.id !== whereClauseId;
            });
        };

        $scope.addWhereClause = function () {
            $scope.relation.whereClauses.push(new WhereClause);
        };

        var WhereClause = function () {
            this.id = (++$scope.currentWhereClauseId);
            this.comparisonOperator = $scope.comparisonOperators[0].name;
            this.comparisonType = $scope.comparisonTypes[0].name;
        };


        // join clauses


        $scope.currentJoinClauseId = 0;

        $scope.addJoinClause = function () {
            $scope.relation.joinClauses.push(new JoinClause);
        };

        $scope.removeJoinClause = function (joinClauseId) {
            $scope.relation.joinClauses = $scope.relation.joinClauses.filter(function (joinClause) {
                return joinClause.id !== joinClauseId;
            });
        };

        var JoinClause = function () {
            this.id = (++$scope.currentJoinClauseId);
        };


        // relations


        $scope.loadRelations = function (connectionName, tableName) {
            if (connectionName === undefined || tableName == undefined) {
                return 1;
            } else {
                var table = $scope.connectionObjects[connectionName].tables.filter(function (table) {
                    return table.fullTableName == tableName;
                })[0];

                $http.get('/connections/' + connectionName + '/tables/' + table.schemaName + '/' + table.tableName + '/relations').
                    success(function (data, status, headers, config) {
                        if ($scope.relationData[connectionName] === undefined) {
                            $scope.relationData[connectionName] = {};
                        }
                        $scope.relationData[connectionName][tableName] = data;
                    }).
                    error(function (data, status, headers, config) {
                        // something went wrong
                    });
            }
        };


        // submit


        $scope.createRelation = function(){
            $http({
                method : 'POST',
                url : '/relations',
                data : { relation: $scope.relation }
            }).
                success(function (data, status, headers, config) {
                   console.log(data);
                }).
                error(function (data, status, headers, config) {
                    console.log(data);

                    // something went wrong
                });
        }


}