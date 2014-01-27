/*
 Author: Kyle Smith
 Date: 01/25/2014

 Simple Fixed Headers allows tables to have fixed headers by simply adding a class to a thead element and calling applyFixedHeaders(); on page load.

 Use:
 Include this file in your application.
 Add the class 'fixed-table-header' to the 'thead' element you want fixed.
 Add the class 'fixed-table-header scrolling-fixed-table-header' to any 'thead' element that's parent table is nested inside a scrolling container.
 Call applyFixedHeaders(); on page load.

 Other Functionality:
 removeFixedHeaders();
 reapplyFixedHeaders();

 Known Issues:
 Multiple layered applications will not hide fixed table headers when layer is hidden.
 */

function applyFixedHeaders(){
    // checks for the extra class used for tables inside scrolling containers
    var scrollingTablePattern = /scrolling-fixed-table-header/;

    // store fixed header tables to be added to the window.onscroll event
    var fixedHeaderTables = [];

    // collect the headers we want fixed
    var headersToFix = document.getElementsByClassName('fixed-table-header');

    if(headersToFix.length > 0){
        for(var x=0; x<headersToFix.length; x++){
            var originalHeader = headersToFix[x];
            var originalTable = originalHeader.parentNode;
            // clone the existing header
            var newHeader = originalHeader.cloneNode(true);
            // remove the class of 'fixed-table-header' from the cloned header
            newHeader.className = newHeader.className.replace('fixed-table-header','');

            // get the dimensions and position of the current header
            var originalHeaderBounds = originalHeader.getBoundingClientRect();

            // create a new table to hold fixed header
            var newTable = document.createElement('table');
            newTable.style.position = 'fixed';
            newTable.style.top = originalHeaderBounds.top + 'px';
            newTable.style.left = originalHeaderBounds.left + 'px';

            // todo Check the browser version
            if(true){
                // chrome, safari
                newTable.className = 'fth-auto-fth'; // i assume your not already using this className

            }else{
                // ie, firefox
                newTable.className = originalTable.className + 'fth-auto-fth'; // i assume your not already using this className
            }

            // clone all the attributes of the old headings into the new heading
            var oldHeadings = originalHeader.getElementsByTagName('th');
            var newHeadings = newHeader.getElementsByTagName('th');
            for(var c=0;c<newHeadings.length;c++){
                var oldHeading = oldHeadings[c];
                var newHeading = newHeadings[c];
                var completeStyle = window.getComputedStyle(oldHeading, null).cssText;
                newHeading.style.cssText = completeStyle;
                var oldHeadingBounds = oldHeading.getBoundingClientRect();
                newHeading.style.minWidth = oldHeadingBounds.width + 'px';
                newHeading.style.height = oldHeadingBounds.height + 'px';
            }

            // append the cloned header to new table
            newTable.appendChild(newHeader);

            // append the table to the document
            document.body.appendChild(newTable);
            fixedHeaderTables.push(newTable);

            // add an onscroll event for the parent container if 'scrolling-fixed-table-header' class is also on this 'thead' element
            if(scrollingTablePattern.test(originalHeader.className)){
                addParentOnScrollEvent(originalHeader, newTable);
            }
        }
    }

    // append header positioning functionality to the existing window.onscroll function
    var existingWindowOnscrollFunction = window.onscroll;
    window.onscroll = function(){
        existingWindowOnscrollFunction;

        fixedHeaderTables.forEach(function(table, idx, arr){
            // find the appropriate header
            var originalHeader = headersToFix[idx];

            if(!scrollingTablePattern.test(originalHeader.className)){
                // find the headers current position
                var originalHeaderTop = originalHeader.getBoundingClientRect().top;

                var headerHeight = originalHeader.clientHeight;

                // find the table holding this header
                var oldTable = originalHeader.parentNode;

                var tableBounds = oldTable.getBoundingClientRect();
                var tableHeight = tableBounds.height;
                // locate the bottom of this table
                var tableBottom = tableHeight - headerHeight;

                // if the table is out of view, put the new header off screen
                if(Math.abs(originalHeaderTop) > (tableBottom)){
                    table.style.top = originalHeaderTop + 'px';
                    // else if the table is in view, but the original header is not, put new header at top of screen
                }else if(originalHeaderTop <= 0){
                    table.style.top = 0 + 'px';
                    // else the table and header are both in view, put the new header directly over the original header
                }else{
                    table.style.top = originalHeaderTop + 'px';
                }
            }else{
                var parentTable = originalHeader.parentNode;
                var parentContainer = parentTable.parentNode;

                var existingParentOnScroll = parentContainer.onscroll;
                parentContainer.onscroll = function(){
                    existingParentOnScroll;

                    var parentContainerTop = parentContainer.getBoundingClientRect().top;
                    var tableBounds = parentTable.getBoundingClientRect();

                    if(tableBounds.top >= parentContainerTop){
                        // the header is still in view, place the fixed header directly over it
                        newTable.style.top = tableBounds.top + 'px';
                    }else{
                        // fix the header at the top of the container
                        newTable.style.top = parentContainerTop + 'px';
                    }
                };
            }
        });
    };

    // reapply the fixedHeaders on window resize
    var existingWindowOnresize = window.onresize;
    window.onresize = function(){
        existingWindowOnresize;

        reapplyFixedTableHeaders();
    }
}

// positions the fixed table header inside a scrollable container upon scrolling the container
function addParentOnScrollEvent(originalHeader, newTable){
    var parentTable = originalHeader.parentNode;
    var parentContainer = parentTable.parentNode;

    var existingParentOnScroll = parentContainer.onscroll;
    parentContainer.onscroll = function(){
        existingParentOnScroll;

        var parentContainerTop = parentContainer.getBoundingClientRect().top;
        var tableBounds = parentTable.getBoundingClientRect();

        if(tableBounds.top >= parentContainerTop){
            // the header is still in view, place the fixed header directly over it
            newTable.style.top = tableBounds.top + 'px';
        }else{
            // fix the header at the top of the container
            newTable.style.top = parentContainerTop + 'px';
        }
    };
}

// remove all auto-generated fixed table headers
function removeFixedHeaders(){
    var headersToRemove = document.getElementsByClassName('fth-auto-fth');
    for(var x=headersToRemove.length-1; x>=0; x--){
        headersToRemove[x].parentNode.removeChild(headersToRemove[x]);
    }
}

function reapplyFixedTableHeaders(){
    removeFixedHeaders();
    applyFixedHeaders();
}

