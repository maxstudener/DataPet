angular.module('data-pet').directive('columnautocomplete', function() {
    function split( val ) {
      return val.split( /\s{1}\s*/ );
    }
    function extractLast( term ) {
      return split( term ).pop();
    }
    return {
        restrict: 'A',
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            $(element).bind( "keydown", function( event ) {
                if ( event.keyCode === $.ui.keyCode.TAB &&
                    $( this ).data( "ui-autocomplete" ).menu.active ) {
                  event.preventDefault();
                }
              })
              .autocomplete({
                minLength: 0,
                source: function( request, response ) {
                  // delegate back to autocomplete, but extract the last term

                  database = scope.databaseWindows.filter(function(databaseWindow){
                      return databaseWindow.active == 'active';
                  })[0];
                  columns = database && database.columns.map(function(k){return k.name});
                  response( $.ui.autocomplete.filter(
                    columns, extractLast( request.term ) ).slice(0, 5) );
                },
                focus: function() {
                  // prevent value inserted on focus
                  return false;
                },
                select: function( event, ui ) {
                  var terms = split( this.value )
                  // remove the current input
                  terms.pop();
                  // add the selected item
                  terms.push( ui.item.value );
                  // add placeholder to get the comma-and-space at the end
                  terms.push( "" );
                  this.value = terms.join( " " );
                  scope.$apply(read(this.value));
                  return false;
                }
              });


            function read(value) {
              ngModel.$setViewValue(value);
            }


        }
    };
});