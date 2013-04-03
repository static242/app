$('#preview').live('pageshow',function(event){
  //alert('Just selected page one!');
    //HEY!!! the page load never pops up :-(
  $.mobile.loadingMessage = "calculating payment schedule..."; 
  $.mobile.pageLoading(); 
  $.mobile.showPageLoadingMsg();
  calcLongList();
  //$.mobile.hidePageLoadingMsg();
});

function calcLongList() {
var numberCount = parseInt("100"); //used on the listing
var myDisplay2 = ""; //null out the display
//
  while (numberCount > 0) {
    var myDisplay2 = myDisplay2 + numberCount;
    document.getElementById("paymentscheduledisplay").innerHTML += myDisplay2 + "<br>";
    numberCount = numberCount - 1;
  } //end while loop
}


$('#menu').live('pagebeforeshow',function(event, ui){
  //alert('Just selected main menu page!');
  var myDisplay3 = "this text populated from .live pagebeforeshow event";
document.getElementById("displayplainmsg").innerHTML = myDisplay3;
});

$(document).ready(function() {
    $.mobile.loadingMessage = "the load msg works, but just not when a page is loaded on a live pagecreate...";

    $('#start').click(function() {
        $.mobile.pageLoading();
        $.mobile.showPageLoadingMsg();
    });
    $('#finish').click(function() {
        $.mobile.pageLoading(true);
        $.mobile.hidePageLoadingMsg();
    });
});
