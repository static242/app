

(function($){

  var Crds = {
    swap: function(sel, replacement){
      var elem = $(sel);
      var prev = elem.prev();
      var parent = elem.parent();

      elem.removeClass("loading").remove();
      var newElem = $(replacement).attr('class', elem.attr('class'));
      
      if (prev.length > 0)
        newElem.insertAfter(prev);
      else
        parent.prepend(newElem);
    },

    Select: {
      addOptionFrom: function(sel, from){
        var val = $.trim($(from).val());
        if (val == "" || $(sel).find("option[value='"+val+"']").length > 0){
          $('#add_error')
                .show()
                .html("The value " + val + " has already been entered.")
                .fadeOut();
          return;
        }

        this.sortOptions($(sel).append( '<option value="'+val+'">'+val+'</option>'));
        $(from).val('');
      },

      selectForSubmit: function(selects){
        selects = $(selects);
        selects.each(function(_,sel){
          $(sel).val($(sel).find("option").map(function(_,o){return $(o).val();}))
        });
        setTimeout(function(){
          selects.val("");
        },0)
      },

      optCompare: function(a,b){
        a = String(a.text).toUpperCase();
        b = String(b.text).toUpperCase();

        return (a > b) ? 1 : (a < b ? -1 : 0)
      },

      sortOptions: function(sel) {
        sel.append(sel.find('option').remove().sort(this.optCompare));
      }
    }

  };
  window.Crds = Crds;

  Crds.table = {

    insertRow: function(row, table, index){
      if (index > 0)
        table.find("tr:nth("+index+")").before(row);
      else
        table.prepend(row);
    },

    findIndex: function(table, row){
      return table.find("tr").index(row);
    },

    moveRow: function(existingTable, newTable, rowSel, fnc){
      var oldIndex = existingTable.find("tr").index(existingTable.find(rowSel));
      var newIndex = newTable.find("tr").index(newTable.find(rowSel));
      var row = existingTable.find(rowSel);

      $this = this;
      if (oldIndex != newIndex)
        $this.collapseRows(row, function(){
          if (newIndex < 0)
            return;
          row = $this.insertRow(newTable.find(rowSel), existingTable, newIndex);
          $this.expandRows(rowSel);
          $this.alternateRows(existingTable);
          if (fnc)
            fnc();
        });
    },   

    collapseRows: function(rows, fnc){
      $(rows)
         .find('td')
         .wrapInner('<div style="display: block;" />')
         .parent()
         .find('td > div')
         .slideUp(500, function(){
            $(this).parent().parent().remove();
            if (fnc)
              fnc();
         });
    },

    alternateRows: function(table){
      var trs = $(table).find("tr").removeClass("normal alt");
      trs.each(function(i,row){
        $(row).addClass((i%2)==0 ? "normal" : "alt");
      });
    },

    expandRows: function(rows, fnc){
      $(rows)
        .find('td')
        .wrapInner('<div style="display: none;" />')
        .parent()
        .find('td > div')
        .slideDown(500, function(){
          var $set = $(this);
          $set.replaceWith($set.contents());
          if (fnc)
            fnc();
        });
    }
  };


  Crds.TableActions = function(options){
    this.prefix = options.prefix;
    this.rowUrl = options.rowUrl;
    this.tableUrl = options.tableUrl;
    this.table = options.table;
    this.hasRowChanged = options.hasRowChanged;
    this.rowIds = [];
    this.timer = null;
  }

  Crds.TableActions.prototype = {
      addRefresh: function(rowId){
        var pos = $.inArray(rowId, this.rowIds);
        if (pos >= 0)
          return;

        this.rowIds.push(rowId);
      },

      removeRefresh: function(rowId){
        var pos = $.inArray(rowId, this.rowIds);
        if (pos < 0)
          return;

        this.rowIds = this.rowIds.slice(0,pos).concat(this.rowIds.slice(pos+1));
      },

      hasRowChanged: function(row1, row2){
        return row1.html() == row2.html();
      },

      failRefresh: function(rowId){
        var actions = $(rowId + " td.actions").removeClass("disabled");
        actions.find(".pulse").removeClass("pulse");
        actions.find(".disabled").removeClass("disabled");
      },

      checkRefresh: function(rows){
        var $this = this;
        var changedRows = [];
        rows = $(rows);
        
        $(rows).each(function(_,t){
          t = $(t);
          var trId = $(t).attr("id");
          var objId = trId.slice($this.prefix.length);
          if ($this.hasRowChanged(t, $("#"+trId))){
            Crds.swap("#"+trId, t);
            $this.highlight("#"+trId);
            $this.removeRefresh(objId);
            changedRows.push(trId);
          } else {
            $("#"+trId+" td.actions .pulse").removeClass("pulse");
            $this.addRefresh(objId);
          }
        });

        if (changedRows.length > 0){
          this.changedRows = changedRows;
          $.ajax($this.tableUrl,  {data: window.location.search.slice(1)});
        }
        this.startCheck();
      },

      tableRefresh: function(table){
        var $this = this;
        $.each(this.changedRows, function(_,rId){
          Crds.table.moveRow(  $($this.table).find("tbody"),
                               $(table).find("tbody"),
                               "#"+rId,
                               function(){
                                  $this.instrumentActionLinks("#"+rId);
                               });
        });
        this.changedRows = null;
      },

      highlight: function(t){
        t = $(t);
        var target = t.css("backgroundColor");
        
        t.css({backgroundColor: "#ffff99"});
        t.animate( {backgroundColor: target}, 
              3000, function(){t.css({backgroundColor: ""})});
      },

      startCheck: function(){
        var $this = this;

        if (this.timer)
          return;

        if (this.rowIds.length < 1){
          this.timer = null;
          return;
        }

        this.timer = setTimeout(function(){
          $.ajax($this.rowUrl,  {data: $.param({ids: $this.rowIds})});
          $this.timer = null;
        }, 10000);
      },

      instrumentActionLinks: function(rows){
        var $this = this;
        var actionMark = "instrumented_action";
        rows = $(rows)
        rows.find(".actions a").each( function(_, elem){
          var oldClick = elem.onclick;
          if ($(elem).data(actionMark))
            return;
          $(elem).data(actionMark, true);

          elem.onclick = function(){
            if (!$(elem).is(".disabled") && !$(elem).parents("td").is(".disabled")){
              $(elem).pulse()
                .parents("td.actions").find("a").addClass("disabled");
              oldClick();
            }
            return false;
          };
        });
      }
  };

  $(function(){

    $("[data-hover_tip]").hover(function(){
      $(this).addClass("hover");

      var tip = $(this).find('div.hover_tip:hidden');
      // if (tip.length == 0){
      //   tip = $("<div class='hover_tip'>"+$(this).data("hover_tip")+"</div>").appendTo($(this));
      // }
      tip.fadeIn(50);
    },
    function(){
      $(this).removeClass("hover");
      $(this).find('div.hover_tip:visible').fadeOut(20);
    });
  });

  //provides simple hover class for hover based styling
  $(function(){
    $("[data-hoverable]").hover(function(){
      $(this).addClass("hover");
    },
    function(){
      $(this).removeClass("hover");
    });
  });


  $.fn.pulse = function(){
    var $this = this;
    $this.addClass("pulse");
    var onePulse = function(){$this.fadeOut("slow", function(){$this.fadeIn("fast", function(){
      if ($this.hasClass("pulse"))
        onePulse();
    })});};
    onePulse();
    return this;
  };


  var Menu = { 
    setup: function(path, hoverFunction){ 
      var timers = {}; 
        
      var slideDown = function(elem){ 
        elem = $(elem); 
        var left = 0; 
        var content = elem.filter(".split").find(".jumpmenu:hidden"); 

        if ($(window).width() < elem.offset().left + content.width()) 
          left = elem.width() - content.width() + 2; 
        content.css({left:left}).slideDown(150); 
      }; 
      var slideUp = function(elem, fnc){ 
        $(elem).filter(".split").find(".jumpmenu:visible").slideUp(60, fnc);        
      }; 
      var hoverOver = function(){ 
        if (timers[this.id]){ 
          clearTimeout(timers[this.id]); 
          timers[this.id] = null; 
        } 
        $(this).addClass("navOver").css({"z-index": 2000}); 
        slideDown(this); 
        if (hoverFunction) 
          hoverFunction(); 
      }; 
      var hoverOut = function(){ 
        if (timers[this.id] ) 
          return; 
        var that = this; 
        $(this).css({"z-index":1500}).removeClass("navOver");  

        timers[that.id] = setTimeout(function(){ 
          slideUp(that, function(){if ($(that).hasClass("navOver")) slideDown(that);}); 
          $(that).removeClass("navOver");            
          timers[that.id] = null; 
        },60); 
      };             
      $(path).hover(hoverOver, hoverOut); 
    } 
  }; 
   
  window.Menu = Menu;

  function monthChanged() {
    var year = jQuery(this).parent().children('select[id*="_1i"]').val();
    var month = jQuery(this).parent().children('select[id*="_2i"]').val();
    var last_day = new Date(year, month, 0).getDate();
    var day_select = jQuery(this).parent().children('select[id*="_3i"]');

    for (d = 28; d <= 31; d++) {
      var op = day_select.children('option[value=' + d + ']');
      if (d > last_day) {
        op.hide();
        op.attr('disabled','disabled');
        if (op.attr('selected')) {
          day_select.children(':first').attr('selected', true);
        }
      } else {
        op.show();
        op.attr('disabled', null);
      }
    }
  }

  function addOnChangeForMonthAndYearSelect(prefix) {
    if (!prefix.match(/^#/)) {
      prefix = "#" + prefix; // backwards-compat
    }
    jQuery(prefix + "_2i, " + prefix + "_1i").change(monthChanged).slice(1).change();
  }

  window.addOnChangeForMonthAndYearSelect = addOnChangeForMonthAndYearSelect;

})(jQuery);
