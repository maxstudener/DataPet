function relationsController($scope, $rootScope, $location, $http) {

    $scope.types = [
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
    $scope.connection = [];
    $scope.fromConnection = {};
    $scope.toConnection = {};


    //********** relations/ **********//


    $scope.relations = [];

    $scope.initializeIndexPage = function(){
        $http.get('/relations.json').
            success(function(data){
                $scope.relations = data;
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });
    };

    // destroy relation
    $scope.destroyRelation = function(relationId){
        $http.delete('/relations/' + relationId).
            success(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'Relation Destroyed!', class: 'alert-success' });
                $scope.relations = $scope.relations.filter(function(relation){
                    return relation._id != relationId;
                });
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error destroying the relation.', class: 'alert-danger' });
            });
    };


    //********** relations/:id/edit **********//


    $scope.initializeEditPage = function () {
        // get connection data
        $http.get('/connections.json')
            .success(function (data) {
                $scope.connections = data;

                $scope.connections.forEach(function (connection, idx, arr) {
                    $scope.getTables(connection);
                });

                $scope.fromConnection = $scope.connections[0];
                $scope.toConnection = $scope.connections[0];

                // now get the relation we are editing
                $http.get($scope.url + '.json')
                    .success(function(data){
                        $scope.relation = data;
                        $scope.fromConnection = $scope.connections.filter(function(connection){
                            return connection._id == $scope.relation.from_connection_id;
                        })[0];
                        $scope.toConnection = $scope.connections.filter(function(connection){
                            return connection._id == $scope.relation.to_connection_id;
                        })[0];
                    })
                    .error(function(){
                        $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
                    });
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });

        $scope.url = $location.absUrl().replace('/edit', '');


    };

    // update relation
    $scope.updateRelation = function () {
        $http.put($scope.url, { relation: $scope.relation })
            .success(function (data) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Relation Updated!.', class: 'alert-success' });
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error updating the relation.', class: 'alert-danger' });
            });
    };


    //********** relations/new **********//


    $scope.initializeNewPage = function () {
        $http.get('/connections.json')
            .success(function (data) {
                $scope.connections = data;

                $scope.connections.forEach(function (connection, idx, arr) {
                    $scope.getTables(connection);
                });

                $scope.relation = {
                    from_connection_id: $scope.connections[0]._id,
                    to_connection_id: $scope.connections[0]._id,
                    relation_type: $scope.types[0].value,
                    where_clauses: [ new WhereClause() ],
                };

                $scope.fromConnection = $scope.connections[0];
                $scope.toConnection = $scope.connections[0];

            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });
    };


    // create relation
    $scope.createRelation = function () {
        $http({
            method: 'POST',
            url: '/relations',
            data: { relation: $scope.relation }
        })
            .success(function (data) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Relation Saved!.', class: 'alert-success' });
                $scope.initializeNewPage();
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error creating the relation.', class: 'alert-danger' });
            });
    };


    //********** connection objects **********//


    $scope.getTables = function (connection) {
        $http.get('/connections/' + connection._id + '/tables')
            .success(function (data) {
                connection.tables = data;
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving table data for ' + connection.name + '.', class: 'alert-danger' });
            });
    };

    $scope.updateFromConnection = function() {
        var connection = $scope.connections.filter(function(connection){
            return connection._id == $scope.relation.from_connection_id;
        })[0];

        $scope.fromConnection = connection;

        // convenience feature - set toConnection to same connection
        // 9 out of 10 times a relation is on the same connection
        $('#to_connection').val(connection._id);
        $scope.toConnection = connection;
        $scope.relation.to_connection_id = connection._id;
    };

    $scope.updateToConnection = function() {
        $scope.toConnection = $scope.connections.filter(function(connection){
            return connection._id == $scope.relation.to_connection_id;
        })[0];
    };

    $scope.changedType = function(){
        if($scope.relation.relation_type == 'has_through'){
            $scope.relation.join_clauses = [new JoinClause()];
            $scope.relation.where_clauses = [];
        }else{
            $scope.relation.where_clauses = [new WhereClause()];
            $scope.relation.join_clauses = [];
        }
    };


    //********** table objects **********//


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

            $http.get('/connections/' + id + '/tables/' + table.schemaName + '/' + table.tableName + '/columns')
                .success(function (data, status, headers, config) {
                    if ($scope.columnData[id] === undefined) {
                        $scope.columnData[id] = {};
                    }
                    $scope.columnData[id][tableName] = data;
                })
                .error(function(){
                    $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
                });
        }
    };

    $scope.loadRelationColumns = function(id){
        $http.get('/relations/' + id + '.json')
            .success(function (data) {
                $scope.throughRelation = data;
                $scope.loadColumns($scope.throughRelation.to_connection_id, $scope.throughRelation.to_table_name);
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });
    };


    //********** where clause objects **********//


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


    //********** join clause objects **********//


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


    //********** relation objects **********//


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

            $http.get('/connections/' + id + '/tables/' + table.schemaName + '/' + table.tableName + '/relations')
                .success(function (data) {
                    if ($scope.relationData[id] === undefined) {
                        $scope.relationData[id] = {};
                    }
                    $scope.relationData[id][tableName] = data;
                })
                .error(function(){
                    $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
                });
        }
    };
}