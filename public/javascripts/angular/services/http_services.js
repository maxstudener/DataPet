app.factory("httpServices", function($rootScope, $http) {
    return {

        // retrieve data from the supplied url
        get: function(json_url, cb){
        $http({
            method: 'GET',
            url: json_url
        })
            .success(function (response) {
                if(response.success){
                    cb(true, response.data);
                }else{
                    $rootScope.$emit('sendNoticeToUser', { text: response.error.message, class: 'alert-danger' });
                    cb(false, undefined);
                }
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'There was an error retrieving data.', class: 'alert-danger' });
                cb(false, undefined);
            });
        },

        // submit the supplied data to the supplied url via POST
        post: function(formData, post_url, cb){
        $http({
            method: 'POST',
            url: post_url,
            data: formData
        })
            .success(function (response) {
                if(response.success){
                    cb(true, response.data);
                }else{
                    $rootScope.$emit('sendNoticeToUser', { text: response.error.message, class: 'alert-danger' });
                    cb(false);
                }
            })
            .error(function(){
                $rootScope.$emit('sendNoticeToUser', { text: 'Internal Server Error', class: 'alert-danger' });
                cb(false);
            });
        },

        // submit the supplied data to the supplied url via PUT
        put: function(formData, post_url, cb){
            $http({
                method: 'PUT',
                url: post_url,
                data: formData
            })
                .success(function (response) {
                    if(response.success){
                        $rootScope.$emit('sendNoticeToUser', { text: 'Success!', class: 'alert-success' });
                        cb(true);
                    }else{
                        $rootScope.$emit('sendNoticeToUser', { text: response.error.message, class: 'alert-danger' });
                        cb(false);
                    }
                })
                .error(function(){
                    $rootScope.$emit('sendNoticeToUser', { text: 'Internal Server Error', class: 'alert-danger' });
                    cb(false);
                });
        },

        delete: function(url, cb){
            $http.delete(url)
                .success(function(){
                    cb(true);
                 })
                .error(function(){
                    $rootScope.$emit('sendNoticeToUser', { text: 'There was an error destroying the relation.', class: 'alert-danger' });
                    cb(false);
                });
        }
    }
    });