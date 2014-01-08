function connectionsController($scope, $http, $rootScope) {
    $scope.connections = []; // any connection object in this Array will be listed in view

    // connections

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
                    connection.tables.push(new Table(tableName));
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

    // objects

    var Connection = function(connectionName){
        this.name = connectionName;
        this.display = false;
        $scope.getTables(this);
    };

    var Table = function(tableName){
        this.name = tableName;
        this.columns = [];
    };

}

