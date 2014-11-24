function relationsController($scope, $rootScope, $http, httpServices) {

    $scope.relationTypes = [
        { name: 'Has', value: 'has' },
        { name: 'Has Through', value: 'has_through' }
    ];

    $scope.comparisonOperators = [
        { name: 'Equal To' },
        { name: 'Greater Than' },
        { name: 'Less Than' },
        { name: 'Like' },
        { name: 'Not Equal To' },
        { name: 'In' },
        { name: 'Not NULL' },
        { name: 'NULL'}
    ];

    $scope.comparisonTypes = [
        { name: 'Column' },
        { name: 'Value' }
    ];

    $scope.relation = {};
    $scope.columnData = {};
    $scope.relationData = {};
    $scope.throughRelation = {};
    $scope.databases = [];
    $scope.fromDatabase = {};
    $scope.toDatabase = {};


    //********** relations/ **********//


    $scope.relations = [];

    $scope.initializeIndexPage = function () {
        httpServices.get('/databases/list', function (success, data) {
            if (success) {
                $scope.databases = data;

                httpServices.get('/database_relations/list', function (success, data) {
                    if (success) {
                        $scope.relations = data;
                        $scope.relations.forEach(function (relation) {
                            var from_database = $scope.databases.filter(function (database) {
                                return database.id == relation.from_database_id;
                            })[0];
                            if (from_database !== undefined) {
                                relation.from_connection_name = from_database.name;
                            }
                        })
                    }
                });
            }
        });


    };

    // destroy relation
    $scope.destroyRelation = function (relationId) {
        httpServices.delete('/database_relations/' + relationId, function (success) {
            if (success) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Relation Destroyed!', class: 'alert-success' });
                $scope.relations = $scope.relations.filter(function (relation) {
                    return relation.id != relationId;
                });
            }
        });
    };

    // update relation
    $scope.updateRelation = function () {
        var relationId = document.getElementById('relation_id').value;

        var postData = { database_relation: $scope.relation }

        httpServices.put(postData, '/database_relations/' + relationId, function (success) {
            if (success) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Relation Updated!.', class: 'alert-success' });
            }
        });
    };


    //********** relations/new **********//


    $scope.initializeNewPage = function () {
        httpServices.get('/databases/list', function (success, data) {
            if (success) {
                $scope.databases = data;
                $scope.databases.forEach(function (database) {
                    $scope.getTables(database);
                });

                $scope.relation = {
                    from_database_id: $scope.databases[0]._id,
                    to_database_id: $scope.databases[0]._id,
                    relation_type: $scope.relationTypes[0].value,
                    where_clauses_attributes: [ new WhereClause() ]
                };

                $scope.fromDatabase = $scope.databases[0];
                $scope.toDatabase = $scope.databases[0];
            }
        });
    };


    // create relation
    $scope.createRelation = function () {
        var postData = { database_relation: $scope.relation }
        httpServices.post(postData, '/database_relations', function (success, data) {
            if (success) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Relation Saved!.', class: 'alert-success' });
                $scope.initializeNewPage();
            }
        });
    };

    $scope.getTables = function (database, cb) {
        database.tables = [];

        httpServices.get('/databases/' + database.id + '/tables', function (success, data) {
            if (success) {
                data.tables.forEach(function (table) {
                    database.tables.push(new Table(table.name));
                });
            }
        });
    };

    $scope.updateFromDatabase = function () {
        var database = $scope.databases.filter(function (database) {
            return database.id == $scope.relation.from_database_id;
        })[0];

        $scope.fromDatabase = database;

        // convenience feature - set toDatabase to same database
        // 9 out of 10 times a relation is on the same database
        $('#to_database_id').val(database.id);
        $scope.toDatabase = database;
        $scope.relation.to_database_id = database.id;
    };

    $scope.updateToDatabase = function () {
        $scope.toDatabase = $scope.databases.filter(function (database) {
            return database.id == $scope.relation.to_database_id;
        })[0];
    };

    $scope.changedType = function () {
        if ($scope.relation.relation_type == 'has_through') {
            $scope.relation.join_clauses_attributes = [new JoinClause()];
            $scope.relation.where_clauses_attributes = [];
        } else {
            $scope.relation.where_clauses_attributes = [new WhereClause()];
            $scope.relation.join_clauses_attributes = [];
        }
    };


    //********** table objects **********//


    $scope.loadColumns = function (databaseId, tableName) {
        var database = $scope.databases.filter(function (database) {
            return database.id == databaseId;
        })[0];

        if (database === undefined || tableName == undefined) {
            return 1;
        } else {
            var table = database.tables.filter(function (table) {
                return table.name == tableName;
            })[0];

            var postData = {
                query_data: {
                    schema_name: table.schemaName,
                    table_name: table.tableName
                }
            };

            httpServices.post(postData, '/databases/' + databaseId + '/tables/columns', function (success, data) {
                if ($scope.columnData[databaseId] === undefined) {
                    $scope.columnData[databaseId] = {};
                }
                $scope.columnData[databaseId][tableName] = data.columns;
            });
        }
    };

    $scope.loadRelationColumns = function (id) {
        if (id !== null) {
            httpServices.get('/database_relations/' + id, function (success, data) {
                if (success) {
                    $scope.throughRelation = data;
                    $scope.loadColumns($scope.throughRelation.relation.to_database_id, $scope.throughRelation.relation.to_table_name);
                }
            });
        }
    };


    //********** where clause objects **********//


    $scope.currentWhereClauseId = 0;

    $scope.removeWhereClause = function (whereClauseId) {
        $scope.relation.where_clauses_attributes = $scope.relation.where_clauses_attributes.filter(function (whereClause) {
            return whereClause.id !== whereClauseId;
        });
    };

    $scope.addWhereClause = function () {
        $scope.relation.where_clauses_attributes.push(new WhereClause);
    };

    var WhereClause = function () {
        this.id = (++$scope.currentWhereClauseId);
        this.comparison_operator = $scope.comparisonOperators[0].name;
        this.comparison_type = $scope.comparisonTypes[0].name;
    };


    //********** join clause objects **********//


    $scope.currentJoinClauseId = 0;

    $scope.addJoinClause = function () {
        $scope.relation.join_clauses_attributes.push(new JoinClause);
    };

    $scope.removeJoinClause = function (joinClauseId) {
        $scope.relation.join_clauses_attributes = $scope.relation.join_clauses_attributes.filter(function (joinClause) {
            return joinClause.id !== joinClauseId;
        });
    };

    var JoinClause = function () {
        this.id = (++$scope.currentJoinClauseId);
    };


    //********** relation objects **********//


    $scope.loadRelations = function (databaseId, tableName) {
        var database = $scope.databases.filter(function (database) {
            return database.id == databaseId;
        })[0];

        if (databaseId === undefined || tableName == undefined) {
            return 1;
        } else {
            var table = database.tables.filter(function (table) {
                return table.name == tableName;
            })[0];

            var postData = {
                query_data: {
                    schema_name: table.schemaName,
                    table_name: table.tableName
                }
            };

            httpServices.post(postData, '/databases/' + databaseId + '/tables/database_relations', function (success, data) {
                if (success) {
                    if ($scope.relationData[databaseId] === undefined) {
                        $scope.relationData[databaseId] = {};
                    }
                    $scope.relationData[databaseId][tableName] = data.relations;
                }
            });
        }
    };

    var Table = function (tableName) {
        this.name = tableName;

        var tableNameParts = tableName.split('.');
        if (tableNameParts[1] !== undefined) {
            this.schemaName = tableNameParts[0];
            this.tableName = tableNameParts[1];
        } else {
            this.schemaName = '';
            this.tableName = tableNameParts[0];
        }
    };
}