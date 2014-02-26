function EditConnectionCtrl($scope, $filter, $http,$location,$log) {

  $scope.initLoad = function(){
    $scope.url = $location.absUrl().replace('/edit', '')
    $http.get($scope.url + '.json').success(function(data){
      $scope.jsonData = data;
      delete $scope.jsonData['_id']; //no reason to edit id
      $scope.jsonDataString = JSON.stringify($scope.jsonData, null, '\t');
    })
  }

  $scope.editorOptions = {
    lineWrapping : true,
    lineNumbers: true,
    mode: {name: "javascript", json: true},
    smartIndent: true,
    tabSize: 2
  };

  $scope.sendData = function(){
    $scope.jsonData = JSON.parse($scope.jsonDataString);
    $http.put($scope.url, {'connection': $scope.jsonData}).success(function(){
      alert('success');
    });
  }
}