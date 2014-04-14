function noticesController($scope, $rootScope) {
    $scope.nextId = 0;
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
    // shifts all remaining notices up if to compensate
    $scope.removeNotice = function(noticeId){
        $scope.notices = $scope.notices.filter(function(notice){
            if(notice.id > noticeId){
                notice.top -= 50;
            }
            return notice.id != noticeId;
        });
    };

    var Notice = function(data){
        this.id = $scope.nextId++;
        this.text = data.text;
        this.class = data.class;
        this.top = ($scope.notices.length * 50 ) + 10;
    };

}