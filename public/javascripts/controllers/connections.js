function connectionsController($scope, $rootScope, $http, $location) {

    // set up the JSON editor
    $scope.editorOptions = {
        lineWrapping: true,
        lineNumbers: true,
        mode: {name: "javascript", json: true},
        smartIndent: true,
        tabSize: 2
    };


    //********** / **********//


    $scope.getConnections = function () {
        $http.get('/connections.json')
            .success(function (data) {
                $scope.connections = data;
                data.forEach(function (connection, idx, arr) {
                    connection.state = 'loading';
                    connection.tables = $scope.getTables(connection);
                });
            })
            .error(function (data) {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });
    };

    $scope.getTables = function (connection) {
        $http.get('/connections/' + connection._id + '/tables')
            .success(function (data) {
                connection.tables = data;
                connection.state = 'loaded';
            })
            .error(function () {
                connection.state = 'error';
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving table data for ' + connection.name + '.', class: 'alert-danger' });
            });
    };

    $scope.createConnectionWindow = function (connection, tableName) {
        $rootScope.$emit('addConnectionWindow', { connection: connection, tableName: tableName });
    };

    $scope.toggleDisplay = function (connection) {
        connection.display = connection.display !== true;
    };

    $scope.displayAllConnections = function () {
        $scope.connections.forEach(function (connection, idx, arr) {
            connection.display = true;
        });
    };


    //********** /connections/ **********//


    $scope.connections = [];

    $scope.initializeIndexPage = function () {
        $http.get('/connections.json').
            success(function (data) {
                $scope.connections = data;
            })
            .error(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });
    };

    // destroy a connection
    $scope.destroyConnection = function (connectionId) {
        $http.delete('/connections/' + connectionId).
            success(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'Connection Destroyed!', class: 'alert-success' });
                $scope.connections = $scope.connections.filter(function (connection) {
                    return connection._id != connectionId;
                });
            })
            .error(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error destroying the connection.', class: 'alert-danger' });
            });
    };


    //********** /connections/:id/edit **********//


    $scope.initializeEditPage = function () {
        $scope.url = $location.absUrl().replace('/edit', '');
        $http.get($scope.url + '.json')
            .success(function (data) {
                $scope.jsonData = data;
                delete $scope.jsonData['_id']; // no reason to edit id
                $scope.jsonDataString = JSON.stringify($scope.jsonData, null, '\t');
            })
            .error(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
            });
    };

    // update connection
    $scope.updateConnection = function () {
        $scope.jsonData = JSON.parse($scope.jsonDataString);
        $http.put($scope.url, {'connection': $scope.jsonData})
            .success(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'Connection Updated!', class: 'alert-success' });
            })
            .error(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error updating the connection.', class: 'alert-danger' });
            });
    };


    //********** /connections/new **********//


    // example JSON
    $scope.jsonData = {
        name: "SampleDB",
        adapter: "jdbc",
        username: "dataPet",
        password: "dataPet",
        driver: "com.ddtek.jdbc.openedge.OpenEdgeDriver",
        url: "jdbc:datadirect:openedge://example.com:7910;databaseName=test",
        db_type: "progress"
    };

    $scope.jsonDataString = JSON.stringify($scope.jsonData, null, '\t');

    // create connection
    $scope.createConnection = function () {
        $scope.jsonData = JSON.parse($scope.jsonDataString);
        $http.post('/connections', {'connection': $scope.jsonData})
            .success(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'Connection Created!', class: 'alert-success' });
            })
            .error(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error creating the connection.', class: 'alert-danger' });
            });
    };

    // test connection
    $scope.testConnection = function () {
        $scope.jsonData = JSON.parse($scope.jsonDataString);
        $http.post('/connections/test', {'connection': $scope.jsonData})
            .success(function (data) {
                var noticeClassName = data.status == 'fail' ? 'alert-danger' : 'alert-success';
                $rootScope.$emit('sendNoticeToUser', { text: data.message, class: noticeClassName });
            })
            .error(function () {
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error testing the connection.', class: 'alert-danger' });
            });
    };


    $scope.test = function(connectionId, sqlQuery){
        console.log(connectionId);

        $rootScope.$emit('addSqlWindow', { connectionId: connectionId, sqlQuery: sqlQuery });

    };

    $scope.sqlWindow = {};

}