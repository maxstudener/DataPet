function connectionsController($scope, $http, $rootScope) {
    $scope.connections = [];

    // connections

    $scope.getConnections = function(){
        $http.get('/connections').
            success(function(data, status, headers, config) {
                data.forEach(function(connection, idx, arr){
                    $scope.connections.push(new Connection(connection.name));
                });
            }).
            error(function(data, status, headers, config) {
                // something went wrong
            });
    };

    $scope.getConnection = function(connectionName){
        return $scope.connections.filter(function(connection){
            return connection.name == connectionName;
        })[0];
    };

    var Connection = function (connectionName) {
        this.name = connectionName;
        this.display = false;
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
          connection.display = true;
        });
    };
}

