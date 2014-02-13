function connectionController($scope, $filter, $http) {
  $scope.editorOptions = {
    lineWrapping : true,
    lineNumbers: true,
    mode: {name: "javascript", json: true},
    smartIndent: true,
    tabSize: 2,
    readOnly: 'nocursor'
  };

  $scope.connections = [];
  $scope.initialize = function(){
    $http.get('/connections.json').
      success(function(data){
        data.forEach(function(relation){
          relation.jsonString = JSON.stringify(relation, null, '\t');
        })
        $scope.connections = data;
      })
  }
}