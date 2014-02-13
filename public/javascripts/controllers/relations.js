function relationController($scope, $filter, $http) {
  $scope.editorOptions = {
    lineWrapping : true,
    lineNumbers: true,
    mode: {name: "javascript", json: true},
    smartIndent: true,
    tabSize: 2,
    readOnly: 'nocursor'
  };

  $scope.relations = [];
  $scope.initialize = function(){
    $http.get('/relations.json').
      success(function(data){
        data.forEach(function(relation){
          relation.jsonString = JSON.stringify(relation, null, '\t');
        })
        $scope.relations = data;
      })
  }
}