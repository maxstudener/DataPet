function databasesController($scope, $rootScope, httpServices) {


    // ********** /databases/new **********


    // initialize the form data with a database connection structure
    $scope.initNew = function () {
        $scope.initForm();
    };

    // ng-change on form input
    $scope.updateFormState = function () {
        $scope.form.state = $scope.checkForm();
    };

    // checks whether all required form fields are populated
    $scope.checkForm = function () {
        if (
            $scope.form.data.database.name === '' ||
                $scope.form.data.database.username === '' ||
                $scope.form.data.database.password === '' ||
                $scope.form.data.database.url === ''
            ) {
            return 'initial';
        } else {
            return 'valid'
        }
    };

    // test the database connection currently entered in the form
    $scope.testConnection = function () {
        httpServices.post($scope.form.data, '/databases/test', function (success) {
            if (success) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Success!', class: 'alert-success' });
                $scope.form.state = 'tested';
            } else {
                $scope.form.state = 'failed';
            }
        });
    };

    // save the database connection currently entered in the form
    $scope.saveConnection = function () {
        httpServices.post($scope.form.data, '/databases', function (success) {
            if (success) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Database Saved!', class: 'alert-success' });
                $scope.initNew();
            } else {
                $scope.form.state = 'failed';
            }
        });
    };


    // ********** /databases ********** //


    // retrieve a list of databases
    $scope.initIndex = function () {
        httpServices.get('/databases/list', function (success, data) {
            if (success) {
                $scope.databases = data;
            }
        });
    };

    // destroy a database
    $scope.destroyDatabase = function (databaseId) {
        httpServices.delete('/databases/' + databaseId, function (success) {
            if (success) {
                $rootScope.$emit('sendNoticeToUser', { text: 'Database Destroyed!', class: 'alert-success' });
                $scope.database = $scope.databases.filter(function (database) {
                    return database.id != databaseId;
                });
            }
        });
    };


    // ********** /databases/:id/edit ********** //


    // initialize the form data with the database structure to edit
    $scope.initEdit = function () {
        $scope.databaseId = document.getElementById('database_id').value;

        $scope.initNew();

        httpServices.get('/databases/' + $scope.databaseId, function (success, data) {
            if (success) {
                $scope.form.data.database = data;
            }
        });
    };

    // update the database connection
    $scope.updateConnection = function () {
        httpServices.put($scope.form.data, '/databases/' + $scope.databaseId, function (success) {
            if (success) {
                $scope.form.state = 'success';
            } else {
                $scope.form.state = 'failed';
            }
        });
    };


    // ********** general functions ********** //


    // initialize the database connection form
    $scope.initForm = function () {
        $scope.form = {
            state: 'initial',
            data: {
                database: {
                    name: '',
                    username: '',
                    password: '',
                    url: ''
                },
                authenticity_token: document.getElementById('rails_authenticity_token').value
            }
        };
    };


    // ********** Main Application ********** //


    $scope.initMain = function () {
        httpServices.get('/databases/list', function (success, data) {
            if (success) {
                $scope.databases = data;
                $scope.databases.forEach(function (database) {
                    $scope.initDatabase(database);
                });
            }
        });

    };

    $scope.initDatabase = function (database) {
        database.state = 'loading';
        $scope.getTables(database);
    };

    $scope.getTables = function (database) {
        httpServices.get('/databases/' + database.id + '/tables', function (success, data) {
            if (success) {
                database.tables = data.tables;
                database.state = 'loaded';
            } else {
                database.state = 'error';
            }
        });
    };

    // opens up all databases and their tables to be filtered
    $scope.displayAllTables = function () {
        $scope.databases.forEach(function (database) {
            database.display = true;
        });
    };

    $scope.toggleDisplay = function (database) {
        database.display = database.display !== true;
    };

    $scope.createDatabaseWindow = function (database, tableName) {
        $rootScope.$emit('addDatabaseWindow', { database: database, tableName: tableName });
    };


}