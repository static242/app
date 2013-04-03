var Filter = {};

(function($) {
  var filters = {
    select: function(container, data){
      container.find("select.filter_select:last").val(data);
    },
    search: function(container, data){
      container.find("input.filter_text:last").val(data);           
    },
    date_range: function(container, data){
      container.find(".input_date_range input:last").val(data);
      container.find(".input_date_range span:last").val(data);      
    },  
    value_range: function(container, data){
      container.find(".range_container:last input:first").val(data["begin"]);  
      container.find(".range_container:last input:last").val(data["end"]);     
    }
  };
  
  //filterSet is json: [{column: , values: , type: },...]
  Filter.load = function(filterSet){
    $.each( filterSet, function(_,f){
      var filterType = filters[f["type"]] || filters["search"];
            
      for (var i = 0; i < f.values.length; i++){
        filterType(Filter.add(f.column), f.values[i]);
      } 
    });
  };

  var adjustWidth = function(filterElement, expand){
    //KLUDGE: adjust colun_filter_header width because IE insists on making it span across the page
    //Since we have to do this, make it animated and pretty
    var newWidth;
    filterElement = $(filterElement);

    var oldWidth = filterElement.find(".column_filter_header").width();
    filterElement.find(".column_filter_header").css({width: 100});
    newWidth = filterElement.find(".column_filter_container").width()+6;
    filterElement.find(".column_filter_header").css({width: oldWidth});

    if (expand && filterElement.find(".filter_inputs li").length > 1)
      filterElement.find(".filter_inputs li:last").hide();
    
    if (expand && filterElement.find(".filter_inputs li").length == 1)
      $(filterElement).find(".column_filter_header").css({width: newWidth});
    else
      $(filterElement).find(".column_filter_header").animate({width: newWidth}, 400, function(){
        filterElement.find(".filter_inputs li").show();
      })
  };

  Filter.add = function(name, selectValue, textValue) {
    var filterElement = $("#" + name + '_filter').show();
    if (filterElement.length == 0)
      return;
    
    filterElement.find(".filter_inputs").append( "<li>" + $( "#" + name + '_filter_field').html() + "</li>");
    $("#filter_display").show();       


    //We need to refresh this for now
    DateRangePicker.refresh();                    

    adjustWidth(filterElement, true);

    return filterElement;
  };
  
  Filter.close = function(element) {
    var filterItems = $(element).find(".column_filter_container ul li");
    if (filterItems.length == 1) {
      filterItems.filter(":last").remove();
      $(element).hide();
    } else {
      filterItems.filter(":last").remove();
    }
    adjustWidth(element);
  };
})(jQuery);

// the following date range initialization uses jQuery
DateRangePicker = {};
(function($){
  DateRangePicker.enable = function(dateRange) {
    var dateRange = $(dateRange);
    var dateRangeInput = dateRange.is("input") ? dateRange : dateRange.find("input");
    var pickCounter = 0;      
    if (dateRange.data('date_picker_attached')){
      return;
    }
    dateRange.data('date_picker_attached', true); 
    var initialDate = dateRangeInput.val().split("-");

    dateRange.hover(
      function(){$(this).css({"background-color":"white"});},
      function(){$(this).css({"background-color":"#F8F8F8"});}
    );
    
    dateRange.DatePicker({
      format:'m/d/Y',
      date: dateRange.val(),
      current: dateRange.val(),
      calendars: 3,
      mode: 'range',
      starts: 1,
      position: 'right',
      onRender: function(date) {      
        return {disabled: (date.valueOf() > (new Date()).valueOf())};
      },
      onBeforeShow: function(){
        pickCounter = 0;          
        dateRange.DatePickerSetDate(dateRangeInput.val().split(' - '), true);
      },
      onChange: function(formated, dates){
        pickCounter = pickCounter +1;
        var text = formated.join(' - ');
        if (dateRange.is("input")){
          dateRange.val(text);
        } else {
          dateRange.find("input").val(text)
          dateRange.find("span").html(text);
        }
        dateRange.change();
        if (pickCounter >= 2){
          pickCounter = 0;
          setTimeout(function(){
            dateRange.DatePickerHide();
          }, 700);
        }
      }
    });
    
    //disable changing calendar units
    $(".datepickerMonth a").addClass("datepickerDisabled");
  };
  DateRangePicker.refresh = function() {
    var hash = window.location.hash.replace('#', '');
    
    $('.input_date_range:visible').each(function(){
      DateRangePicker.enable($(this));      
    });
  };
  
  $(function(){DateRangePicker.refresh();});
})(jQuery)

