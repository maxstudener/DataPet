app.filter('with', function() {
    return function(items, field) {
        console.log(field);
        if(!Boolean(field)){
            return items;
        }
        var result = {};
        for(key in items){
            var value = items[key];
            if(key.indexOf(field) != -1){
                result[key] = value;
            }
            if(Boolean(value) &&  String(value).indexOf(field) != -1){
                result[key] = value;
            }
        }
        return result;
    };
});