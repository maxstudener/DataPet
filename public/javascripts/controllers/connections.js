function connectionsController($scope, $http, $rootScope) {
    $scope.connections = [];

    // connections

    $scope.getConnections = function(){
      $http.get('/connections.json').
        success(function(data, status, headers, config) {
          $scope.connections = data;
          data.forEach(function(connection, idx, arr){
            connection.tables = $scope.getTables(connection);
          });
        }).
        error(function(data, status, headers, config) {
            // something went wrong
        });
    };

    $scope.getTables = function (connection) {
      $http.get('/connections/' + connection._id + '/tables').
        success(function (data, status, headers, config) {
          connection.tables = data;
        }).
        error(function (data, status, headers, config) {
            // something went wrong
        });
    };


    // general functions
    $scope.createConnectionWindow = function(connection, tableName){
      $rootScope.$emit('addConnectionWindow', { connection: connection, tableName: tableName });
    };

    $scope.toggleDisplay = function(connection){
      connection.display = connection.display !== true;
    };

    $scope.displayAllConnections = function(){
      $scope.connections.forEach(function(connection, idx, arr){
        connection.display = true;
      });
    };
}

