function noticesController($scope, $rootScope, $timeout) {
    $scope.currentId = 0;
    $scope.notices = [];

    // places a notice in the upper right corner of the page for the user
    // accepts a data object with two parameters: text, class
    // text:  the notice text to be displayed
    // class: a bootstrap alert-box modifier class ( alert-info, alert-danger, alert-warning, alert-success )
    // $rootScope.$emit('sendNoticeToUser', { text: 'test', class: 'alert-info' });
    $rootScope.$on('sendNoticeToUser', function(event, data){
        $scope.notices.push(new Notice(data));
    });

    // removes a notice when clicked by user
    // shifts remaining notices up to compensate
    $scope.removeNotice = function(noticeId){
        $scope.notices = $scope.notices.filter(function(notice){
            if(notice.id > noticeId){
                notice.top -= 50;
            }
            return notice.id !== noticeId;
        });
    };

    var Notice = function(data){
        var id = $scope.currentId++;
        this.id = id;
        this.text = data.text;
        this.class = data.class;
        this.top = ($scope.notices.length * 50 ) + 10;
        $timeout(function(){
            $scope.removeNotice(id);
        }, 8000);
    };

}