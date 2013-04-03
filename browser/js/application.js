// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

/*
 * implements a ubiquitous progress indicator
 * fired when prototype AJAX calls are operating
 */
Ajax.Responders.register({
  onCreate: function(request){
    if($('ajax_busy') && Ajax.activeRequestCount > 0) {
      Effect.Appear('ajax_busy', {duration: 0.5, queue: 'end'});
    }
    try
    {
      if (request.url.indexOf("blackboard/update") < 0) {
        Flash.clear();
      }
    }
    catch(ignore)
    {
    }
  },
  onComplete: function(){
    if($('ajax_busy') && Ajax.activeRequestCount == 0) {
      Effect.Fade('ajax_busy', {duration: 0.5, queue: 'end'});
    }
  }
});

/*
 * This function should be called to finalize 
 * the loading of a form from an ajax call. It 
 * sets the initial focus on the first field.
 */
var node; 
var childNode;
function finalizeAjaxFormLoad(divId) {
  var div = document.getElementById(divId);
  var found = false;

  for (var i=0; i<div.childNodes.length; i++)
  {
    node = div.childNodes.item(i);
    if(node.nodeName == 'FORM')
    {
      setTimeout("setInitialFocus(node)", 250);
      break;
    }
    else if(node.nodeName == 'FIELDSET')
    {
      for(var j=0; j<node.childNodes.length; j++)
      {
        if(node.childNodes[j].nodeName == 'FORM')
        {
          childNode = node.childNodes[j];
          setTimeout("setInitialFocus(childNode)", 500);
          found = true;
          break;
        }
      }
      if (found)
      {
        break;
      }
    }
  }
}



function disableSubmit(myform, btn_name, disabled_text)
{
  try
  {
    var buttons = myform.getInputs('submit', btn_name);
    myform.getInputs('button', btn_name).each(function(x){buttons.push(x);});
    buttons.each(function(x){x.disabled = true; x.value=disabled_text;});
  }
  catch (ignore)
  {
  }
  return true;
}

function restoreSubmit(myform, btn_name, idle_text)
{
  try
  {
    var buttons = myform.getInputs('submit', btn_name);
    myform.getInputs('button', btn_name).each(function(x){buttons.push(x);});
    buttons.each(function(x){x.disabled = false; x.value=idle_text;});
  }
  catch(ignore)
  {
  }
  return true;
}

/*
 * Locates the first field of the first form and sets the focus.
 * Only looks for text, textarea, select and checkbox.
 */
function setInitialFocus(element)
{
  if ((element != null) && (element.nodeName == "FORM"))
  {
    if (element.elements)
    {
      for(var i=0; i<element.elements.length; i++)
      {
        var elem = element.elements[i];
        if ((elem.type == "text") ||
            (elem.type == "textarea") ||
            (elem.type == "password") ||
            (elem.type == "checkbox") ||
            (elem.nodeName == "SELECT"))
        {
          if (!elem.disabled)
          {
            try
            {
              elem.focus();
            }
            catch(ignore)
            {
            }
            break;
          }
        }
      }
    }
  }
  else if (element != null)
  {
    var elem = $(element);
    if ((elem.type == "text") ||
        (elem.type == "textarea") ||
        (elem.type == "password") ||
        (elem.type == "checkbox") ||
        (elem.nodeName == "SELECT"))
    {
      if (!elem.disabled)
      {
        elem.focus();
      }
    }
  }
}

function portToggle(port)
{
  var elem = $("port_" + port + "_button");
  var d = new Date();
  if(elem.src.indexOf("up") >= 0)
  {
    elem.src = "/images/down_normal_16.gif?" + d.getTime();
  }
  else
  {
    elem.src = "/images/up_normal_16.gif?" + d.getTime();
  }
  new Ajax.Request('/mapping/display_hosts_and_maps/'+port, {asynchronous:true, evalScripts:true}); 
  return false;
}

function menuToggle(title)
{
  sideHeadToggle($(title + "_header"));
  togglerSwitch($(title + "_toggler"));
  // $(title + "_content").toggle();
  new Effect.toggle($(title + "_content"),'blind', {duration: .2});
  // ajax lets session know about changes
  new Ajax.Request('/users/update_menu_state?title='+title, {asynchronous:true, evalScripts:true}); return false;
}

/*
 * toggles the sidebar headers from dark to light when open 
 * or closed, respectively
 */
function sideHeadToggle(elem)
{
    if ($(elem).className == 'header_closed') {
        $(elem).className = 'header';
    } else {
        $(elem).className = 'header_closed';
    }
}

/* switches the 'toggler' from + to - and vice versa */
function togglerSwitch(elem)
{
    if ($(elem).innerHTML == '+')
        $(elem).innerHTML = '&ndash;';
    else
        $(elem).innerHTML = '+';
}

var help_open = false;
function toggleHelpMenu(elem)
{
    if (help_open) {
        closeHelpMenu(elem);
    } else {
        openHelpMenu(elem);
    }
}

var Flash = {
  _set_message: function(level, message) {
	  var flash = this._get_flash_elem();
    flash.className = "flash-" + level;
    flash.innerHTML = message;
    flash.show();
  },
  _get_flash_elem: function() {
	  var flash = $('flash');
	  
	  // If the Flash DIV doesn't exist, create it
    if (!flash)
    {
      var content = $("flash_wrapper");
      flash = new Element('div', { id: 'flash' } );
      content.insert({top: flash});
	  }
    return flash;
  },
  
  warn: function(message) {
    this._set_message("warn", message);
  },
  error: function(message) {
    this._set_message("error", message);
  },
  success: function(message) {
    this._set_message("success", message);
  },
  notice: function(message) {
    this._set_message("notice", message);
  },
  clear: function() {
	  var flash = this._get_flash_elem();
    this._set_message("", "");
	  flash.hide();
  }
};

// extension of prototype's PeriodicalExecuter that includes start/stop functionality
PeriodicalExecuterToggled = Class.create();
Object.extend(Object.extend(PeriodicalExecuterToggled.prototype, PeriodicalExecuter.prototype),
 {
     initialize: function(callback, frequency, register) {
         this.callback = callback;
         this.frequency = frequency;
         this.currentlyExecuting = false;
         this.timer = null;
         if (register)
         {
           this.registerCallback();
         }
     },

     setCallback: function(newCallback) {
       this.clearCallback();
       this.callback = newCallback;
       this.registerCallback();
     },

     registerCallback: function() {
         this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
     },

     clearCallback: function() {
         clearInterval(this.timer);
         this.timer = null;
     },
     
     resetCallback: function() {
         clearInterval(this.timer);
         this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
       },

     setFrequency: function(f) {
         this.frequency = f;
         if (this.timer != null) {
             this.clearCallback();
             this.registerCallback();
         }
     }
 });

// extension of prototype's PeriodicalExecuter that includes start/stop functionality
var SystemLockoutPinger = Class.create();
Object.extend(Object.extend(SystemLockoutPinger.prototype, PeriodicalExecuter.prototype),
{
  initialize: function(refresh_url, reboot_url, lockout_type) {
    this.timer = null;
    this.frequency = 10;
    this.elapsed = 0;
    this.offset = 0;
    this.currentlyExecuting = false;
    this.refresh_url = refresh_url;
    this.reboot_url = reboot_url;
    this.current_url = refresh_url;
    this.lockout_type = lockout_type;
    if (lockout_type == 'shutdown') {
	    this.on_complete_message =  "The system has been shut down. ";
	  } else if (lockout_type == 'reset') {
      this.on_complete_message =  "The appliance is rebooting.<br/><br />You must reconfigure the network settings from the console before using the web interface.";
	  } else {
      this.on_complete_message = "The system is rebooting...";
    }

    this.callback = function(pinger) {
        new Ajax.Request(pinger.current_url, 
          { asynchronous:true
          , evalScripts:true
          , onComplete: function(transport) {
                var show_time = true;
                if (transport.status == null || transport.status < 200 || transport.status >= 300) {
                  Element.select($('lockout_text'), 'p').first().update(pinger.on_complete_message);
                  if (pinger.lockout_type == 'shutdown' || pinger.lockout_type == 'reset') {
                    $('elapsed_lockout_time').hide();
                    show_time = false;
                    pinger.clearCallback();
                  } else {
                    pinger.current_url = pinger.reboot_url
                  }
                } else if (pinger.elapsed+pinger.offset == 0) {
                  pinger.elapsed = (parseInt(transport.responseText) + pinger.offset);
                  if (pinger.elapsed < 0) {
                    pinger.offset = pinger.elapsed * -1;
                  }
                } 
                if (pinger.elapsed >= 0) {
                  pinger.elapsed += pinger.frequency;
                }
                var hours = (pinger.elapsed / 3600).floor();
                var mins = ((pinger.elapsed - (hours*60)) / 60).floor();
                var secs = (pinger.elapsed - (hours * 3600) - (mins * 60)).floor();
                var timeString = new Date(0, 0, 0, hours, mins, secs).toTimeString().split(' ').first();
                $('elapsed_lockout_time').update("Elapsed Time: " + timeString);
                if (show_time && (pinger.elapsed > 0)) {
                  $('elapsed_lockout_time').show();
                }
              }
      })};  
      
      this.registerCallback();     
  },
  
  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  clearCallback: function() {
    clearInterval(this.timer);
    this.timer = null;
  },
  
  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.callback(this);
      } catch(ignore){}
      finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
  
// extension of prototype's PeriodicalExecuter that includes start/stop functionality
var PeriodicallyPingSystem = Class.create();
Object.extend(Object.extend(PeriodicallyPingSystem.prototype, PeriodicalExecuter.prototype),
{
  initialize: function(callback, delay, frequency, span_element, image_element, start, timeout, timeoutMessage) {
    this.callback = callback;
    this.delay = delay;
    this.frequency = frequency;
    this.currentlyExecuting = false;
    this.timer = null;
    this.timeout = timeout;
    if (start) {
      this.registerCallback();
    }
    this.spanElement = $(span_element);
    this.imageElement = $(image_element);
    this.currentValue = 0;
    if (timeoutMessage == null) {
      this.timeoutMessage = "The appliance has not rebooted. You may wish to investigate.";
    } else {
      this.timeoutMessage = timeoutMessage;
    }
    if (timeout == null) {
      this.timeout = 600;
    } else if (timeout >= 0) {
      this.timeout = Math.max(timeout, 360);
    } else {
      this.timeout = timeout;
    }
  },
  
  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  clearCallback: function() {
    clearInterval(this.timer);
    this.timer = null;
  },
  
  resetCallback: function() {
    clearInterval(this.timer);
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  setFrequency: function(f) {
    this.frequency = f;
    if (this.timer != null) {
      this.clearCallback();
      this.registerCallback();
    }
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      this.currentValue += this.frequency;
      try {
        this.currentlyExecuting = true;
        if (this.currentValue > this.delay)
        {
          this.callback(this);
        }
      } finally {
        if ((this.timeout >= 0) && (this.currentValue > this.timeout))
        {
          if (this.imageElement) {
            this.imageElement.update("");
          }
          if (this.spanElement) {
            this.spanElement.update("<p>Elapsed time: " + this.currentValue + " seconds.<br /><br />" + this.timeoutMessage + "</p><br />");
          }
        }
        else
        {
          if (this.spanElement) {
            this.spanElement.update("<p>Elapsed time: " + this.currentValue + " seconds.</p>");
          }
        }
        this.currentlyExecuting = false;
      }
    }
  }
});

// extension of prototype's PeriodicalExecuter that includes start/stop functionality
var DelayedRedirect = Class.create();
Object.extend(Object.extend(DelayedRedirect.prototype, PeriodicalExecuter.prototype),
{
  initialize: function(callback, delay, frequency, timeout, span_element) {
    this.callback = callback;
    this.delay = delay;
    this.frequency = frequency;
    this.currentlyExecuting = false;
    this.timer = null;
    this.timeout = timeout;
    this.registerCallback();
    this.spanElement = null;    
    if (span_element != null) {
      this.spanElement = $(span_element);
    }
    this.currentValue = 0;
    this.timeoutMessage = "The web server has not started yet. Try manually refreshing your browser.";
    if (timeout == null) {
      this.timeout = 120;
    } else {
      this.timeout = timeout;
    }
  },
  
  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  clearCallback: function() {
    clearInterval(this.timer);
    this.timer = null;
  },
  
  resetCallback: function() {
    clearInterval(this.timer);
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  setFrequency: function(f) {
    this.frequency = f;
    if (this.timer != null) {
      this.clearCallback();
      this.registerCallback();
    }
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      this.currentValue += this.frequency;
      try {
        this.currentlyExecuting = true;
        if (this.currentValue > this.delay)
        {
          this.callback(this);
        }
      } finally {
        if ((this.timeout >= 0) && (this.currentValue > this.timeout))
        {
          if (this.spanElement) {
            this.spanElement.update("<p>Elapsed time: " + this.currentValue + " seconds.<br /><br />" + this.timeoutMessage + "</p><br />");
          }
        }
        else
        {
          if (this.spanElement) {
            this.spanElement.update("<p>Elapsed time: " + this.currentValue + " seconds.</p>");
          }
        }
        this.currentlyExecuting = false;
      }
    }
  }
});

/* Accordion - allowing only one open at once. To be used when panels are unrelated (i.e. system settings) */
function single_accordion(header) {
  var parent = $(header.parentNode.id);
  var body = $(header.parentNode.id + '-body');
  if (parent.hasClassName('open_panel') ) {
    /* the selected element is open so we close it */
    Effect.toggle(body, 'slide', {duration:0.2});
    parent.toggleClassName('open_panel');
  }
  else {
    /* not open so we open it and close any other that is open */
    // var top = $(parent.parentNode.id);
		var top = parent.parentNode;
		while(top && top.className != 'accordion') {
			top = top.parentNode;
		}
		top = $(top.id);
    var children = top.getElementsByClassName("open_panel");
    for(i=0; i< children.length; i++) {
      var child = children[i];
      var child_body = $(child.id + "-body");
      //alert("openning " + child_body.id + ": toggling class name for " + child.id);
      Effect.toggle(child_body, 'slide', {duration:0.2});
      child.toggleClassName('open_panel');
    }
    /* all open things closed so open the selected on */
    Effect.toggle(body, 'slide', {duration:0.2});
    parent.toggleClassName('open_panel');
  }
}

/* Accordion - allowing multiple open at once. To be used when panels are related (i.e. ethernet ports) */
function accordion(header) {
  var el = $(header.parentNode.id + '-body');
  Effect.toggle(el, 'slide', {duration:0.2});
}

function acc_hilite(obj) { $(obj).toggleClassName('acc_header_hilite'); }

/* Changes the first child img to a spinner */
function spin_image(item)
{
  var kids = item.childNodes;
  if (kids.length > 0) {
    var first = kids[0];
    if (first.tagName.toUpperCase() == 'IMG')
    {
      first.setAttribute("src", "/images/indicator.gif");
    }
  }
}

/* Changes the first child img to a spinner after first getting confirmation, then issues an ajax request*/
function confirm_and_spin(msg, item, url) {
  if (confirm(msg)) {
    spin_image(item);
    new Ajax.Request(url, {asynchronous:true, evalScripts:true});
  }
  return false;
}

function job_type_selected() {
  var el = $('schedule_job_id');
  var id = el.value;
  var desc = $('job_description');
  var values = $('job_descriptions');
  var tuples = values.value.split(",");
  for(var i=0; i<tuples.length; i++) {
    var tuple = tuples[i].split(":");
    if(tuple[0] == id) {
      if (tuple[1] == 'true') {
        $('recurrence_options').show();
        $('no_recurrence_msg').hide();
      }
      else {
        $('recurrence_options').hide();
        $('no_recurrence_msg').show();
        $('schedule_recurrence_one_time').click();
      }
      desc.innerHTML = tuple[2];
    }
  }
}

function showHideContainer(container_id, checkbox_id) {
    if ($(checkbox_id).checked) {
        Effect.BlindDown(container_id, { duration: 0.2 });
        }
    else {
        Effect.BlindUp(container_id, { duration: 0.2 });   
    }
}

function toggleVariable(container, var_name) {
  if ($(var_name).value == "true") 
  {
    Effect.BlindUp(container, { duration: 0.2 });
    $(var_name).value = "false";
  } 
  else
  {
    Effect.BlindDown(container, { duration: 0.2 });
    $(var_name).value = "true";
  }
}

           
/* user password fields */
var initial_focus_toggle_password;
function togglePassword(container, var_name) {
  if ($(var_name).value == "true") 
  {
    Effect.BlindUp(container, { duration: 0.2 });
    $(var_name).value = "false";
    var elem = $(container);
    for (var i=0; i<elem.childNodes.length; i++)
    {
      var node = elem.childNodes.item(i);
      if (node.type == 'password') {
        node.value = '';
      }
    }
  } 
  else
  {
    Effect.BlindDown(container, { duration: 0.2 });
    $(var_name).value = "true";
    initial_focus_toggle_password = $("initial_focus");
    setTimeout("setInitialFocus(initial_focus_toggle_password)", 500);
  }
}

/* Verifies that an action can be taken. 
   If the container is not open and a confirmation message is provided, 
     the user must confirm (as in delete) before the url is called.
   If the container is not open and there is not a confirmation message,
    the url is called.
   If the container is open, the alert message is displayed. */     
function verify_action(container, url, alert_msg, confirm_msg) {
  if ($(container).style.display == "none") {
    if ((confirm_msg.length == 0) || ((confirm_msg.length > 0) && confirm(confirm_msg))) {
      new Ajax.Request(url, {asynchronous:true, evalScripts:true});
      return false;
    }
  } else {
    alert(alert_msg);
  }
  return true;
}

/* Displayed when a time zone change occurs in the UI */
function timeZoneChanged(msg) {
	if (confirm(msg + "\n\nDo you want to reboot now?")) {
		window.location = "/system/reboot";
	}
}

/* Monkey patching Prototype's Element class to
 * add methods for setting width, height, top and left
 * properties.
 */
Element.addMethods({
  setWidth: function(element,w) {
    element = $(element);
    element.style.width = w +"px";
  },
  setHeight: function(element,h) {
    element = $(element);
    element.style.height = h +"px";
  },
  setTop: function(element,t) {
    element = $(element);
    element.style.top = t +"px";
  },
  setLeft: function(element,l) {
    element = $(element);
    element.style.left = l +"px";
  }
});


//this is here for legacy api ; TODO: get rid of it
 var NavigationHelper = function(path, hoverFunction){ 
   Menu.setup(path, hoverFunction); 
 };   
 NavigationHelper.prototype = {}; 


function applyToAll(mainElement, namePattern, form_name) {
  var value = mainElement.value;
  var form = $(form_name);
  var elements = form.getElements();

  for(var i=0; i<elements.length; i++) {
    var elem = elements[i];
    if(elem.name.match(namePattern) && (mainElement.name != elem.name)) {
      elem.value = value;
    }
  }
}

function reverse_applyToAll(mainElement, namePattern, form_name, customValue) {
  var form = $(form_name);
  var elements = $A(form.getElements().collect(function(e) {
    if(e.name.match(namePattern) && !(mainElement == e)) {
      return e.value;
    } else {      
      return null;
    }
  })).compact();
  var unique = elements.uniq();
  if(unique.length == 1) {
    mainElement.value = unique.first();
  } else {
    mainElement.value = customValue;
  }
}

var crossroads = {
  togglebb: function() {
    var blackboard = $('blackboard');
    Effect.toggle(blackboard, 'appear', { duration:0.3 });
    $("bb_icon").src = "/images/icons/notify" + (blackboard.full ? "_full.gif" : "_empty.gif");
  },
  forceopenbb: function() {
    Effect.Appear($('blackboard'), { duration:0.3 });
  },
  bb_full: function() {
    $('blackboard_icon').visualEffect('highlight', {
      duration: 0.5, 
      startcolor: '#7691b3', 
      endcolor: '#3d577a', 
      keepBackgroundImage: true
    });
    $('blackboard').full = true;
    $("bb_icon").src = "/images/icons/notify_full.gif";
  },
  bb_empty: function() {
    $('blackboard').full = false;
    $("bb_icon").src = "/images/icons/notify_empty.gif";
  },
  toggle_tips: function() {
    if ($('contexthelp')) {
      $('contexthelp').toggle();
    } else {
      var contexthelp = new Element('div', { id: 'contexthelp' } );
      $('content').insert({before: contexthelp});
    }
    $('content').toggleClassName("showing_tips");
    new Ajax.Request('/help/toggle_tips');
  },
  tip_over: function() {
    $('tipicon_img').src = "/images/btn_tips_over.png";
  },
  tip_out: function() {
    $('tipicon_img').src = "/images/btn_tips.png";
  }
}

function toggleSessionOptions() {
  if($('options_sessions_expire').checked) {
    $('options_session_duration').enable();
    $('duration_label').removeClassName('disabled_label');
    $('duration_hint').removeClassName('disabled_label');
  } else {
    $('options_session_duration').disable();
    $('duration_label').addClassName('disabled_label');
    $('duration_hint').addClassName('disabled_label');
  }
}

function clearCheckboxes(oForm)
{
  var aElems = oForm.elements;

  for (var i=0;i<aElems.length;i++)
  {
    if (aElems[i].type == "checkbox")
    {
      aElems[i].checked = false;
    }
  }
  oForm.compare.disabled = true;
}

function before_pagination(el)
{
	var current = el;
	while(current != null && current.className != 'paginator') {
		current = current.parentNode;
	}
	if (current) {
		$(current).update("<span class='action_progress'>Loading...</span><img src='/images/horizontal_progress_bar.gif'/>");
	}
}

/**
 *  The Dialog object display a dialog within the existing page. The key behavior includes
 *  overlaying the page with a translucent background that will also prevents the user from
 *  interacting with the base page until the dialog has been closed.
 *  
 *  It has dependencies on the Prototype and Scriptaculous libraries, so you'll have to
 *  make sure they are loaded before using this library.
 *  
 *  TODO: Add a keyboard handler that won't allow focus to move anywhere other than the dialog
 *  TODO: Add support for auto-focusing a field or button in the dialog
 *  TODO: Accept onload, onunload callback functions
 *  TODO: Refactor to depend on Prototype 1.6
 *  TODO: Handle non-animated case better
 */
var Dialog = new function()
{
  this.visible = false;

  this.LOADING_IMG = "/images/loading.gif";

  this.overlayOpacity = 0.8;  // controls transparency of shadow overlay
  this.overlayDuration = 0;
  this.animate = true;      // toggles resizing animations
  this.resizeSpeed = 7;    // controls the speed of the image resizing animations (1=slowest and 10=fastest)  
  this.resizeDuration = 0;

  /**
   *  Displays the dialog, including the overlay, dialog and contents
   *  If a content node is passed, it's contents will be cloned over
   *  into the dialog and displayed.
   * 
   *  Inserts html at the bottom of the page which is
   *  used to display the shadow overlay and the image container.
   * 
   *  @param contentNode   a node id or node to load content from
   *  @param config        A Hash of configuration options
   */
  this.open = function(content, config) {  

    var contentTarget = null;
    if (content instanceof Ajax.Response)
    {
      var objBody = $$('body').first();
      contentTarget = document.createElement("div");
      contentTarget.setAttribute('id','contentTarget');
      contentTarget.update(content.responseText);
      objBody.insert(contentTarget);
      
      content = contentTarget;
    }

    var contentNode = $(content);

    if (config) {
      this.animate = config['animate'];
    }

    // TODO: Look at how Prototype merges config
    if (this.animate) {
      this.overlayDuration = 0.2;  // shadow fade in/out duration
      if(this.resizeSpeed > 10){ this.resizeSpeed = 10;}
      if(this.resizeSpeed < 1){ this.resizeSpeed = 1;}
      this.resizeDuration = (11 - this.resizeSpeed) * 0.15;
    }

    this._insertHTML();

    this._observePage();

    this._recenter();

    // clear the old contents and populate the new content into the dialog 
    // Then remove the node we created to hold the response from the body
    this._removeChildrenFromNode(this.content.firstChild)
    this._copyNodeContents(contentNode, this.content.firstChild);
    if (contentTarget)
    {
      objBody.removeChild(contentTarget);
    }
    
    // Fade the overlay in and show the lightbox
    new Effect.Appear(this.overlay,
    {
      duration: this.overlayDuration,
      from: 0.0,
      to: this.overlayOpacity,
      afterFinish: this._displayContent.bindAsEventListener(this)
    });
    
    this.visible = true;
  };
  
  /**
   *  Closes the dialog, including the overlay and dialog.
   */
  this.close = function() {
    if (Prototype.Browser.IE) {
      $$("select").each(function(select){ select.show() })
    }

    this._stopObservingPage();
    this.lightbox.hide();
    new Effect.Fade(this.overlay, { duration: this.overlayDuration});

    // Remove the dialog elements and our local properties
    // Element.remove('mask');
    Element.remove('lightbox');
    Element.remove('overlay');
    this.content = null;
    this.overlay = null;
    this.lightbox = null;
    
    this.visible = false;
  };

  /**
   *  Closes the dialog, including the overlay and dialog.
   */
  this.load = function(contentNode) {
    contentNode = $(contentNode);

    // If dialog is visible, replace contents, otherwise call open
    // clear the old contents and populate the new content into the dialog 
    this._removeChildrenFromNode(this.content.firstChild)
    this._copyNodeContents(contentNode, this.content.firstChild);
  };

  this.closeBox = new function()
  {
    this.enabled = true;
    this.disable = function()
    {
      // disable the close box here. update the state
      this.enabled = false;
    };
    this.enable = function()
    {
      // enable the close box here. update the state
      this.enabled = true;
    };
  };

  this.displayLoadDialog = new function()
  {
  };

  this.hideLoadDialog = new function()
  {
  };

  /* ===============================================
     Private Methods
     =============================================== */
  this._insertHTML = function() {

    var objBody = $$('body').first();

    // var iframe = this._createMask();
    // objBody.insert(iframe);

    this.overlay = new Element('div', { 'id': 'overlay' });
    this.overlay.setStyle({ display: 'none' });
    this.overlay.observe('click', this._overlayHandler);
    objBody.insert(this.overlay);

    this.lightbox = new Element('div', { 'id': 'lightbox' });
    this.lightbox.setStyle({ display: 'none' });
    this.lightbox.observe('click', this._lightboxHandler.bindAsEventListener(this));

    objBody.insert(this.lightbox);

    var objDialogContent = new Element('div', { 'id': 'dialogContent' });
    var objDialogContentFrame = new Element('div', { 'id': 'dialogContentFrame' });
    objDialogContent.insert(objDialogContentFrame);

    this.lightbox.insert(objDialogContent);

    // iframe.clonePosition(objDialogContent);

    // Make sure Prototype has extended these objects and cache them
    // on the Dialog
    this.content = $(objDialogContent);

    // When Lightbox starts it will resize itself from 250 by 250 to the current image dimension.
    // If animations are turned off, it will be hidden as to prevent a flicker of a
    // white 250 by 250 box.
    // TODO: Animate this with Scriptaculous
    if (this.animate) {
      this.content.setWidth(500);
      this.content.setHeight(335);
    } else {
      this.content.setWidth(1);
      this.content.setHeight(1);
    }
    
    // In IE we need to hide select elements that might poke through the overlay
    if (Prototype.Browser.IE) {
      $$("select").each(function(select){ select.hide() })
    }
    
  };

  /**
   *  Creates an a mask for the dialog, using an iframe, in order to keep
   *  selects, flash and other windowed objects from showing through
   *  
   *  @return {Element} The new shim element
   */
  this._createMask = function()
  {
    var iframe = new Element('iframe', { 'id': 'mask', 'frameBorder': 'no', 'className': 'mask' });
    if (Prototype.Browser.IE) {
      iframe.src = "javascript:false";
    }
    return iframe;

  //     var iframe = document.createElement('iframe');
  //     iframe.frameBorder = 'no';
  //     iframe.className = 'dialogMask';


  //     if(Ext.isIE && Ext.isSecure){
  //         iframe.src = Ext.SSL_SECURE_URL;
  //     }
  //     var mask = Ext.get(this.dom.parentNode.insertBefore(iframe, this.dom));
  //     shim.autoBoxAdjust = false;
      // return mask;
  };

  this._displayContent = function()
  {
    this.lightbox.show();
  };

  this._copyNodeContents = function(src, destination) {
    var content = $(src).cloneNode(true);
    content.style['display'] = 'block';
    $(destination).insert(content);  
  };

  this._removeChildrenFromNode = function(node)
  {
    while (node.hasChildNodes())
    {
      node.removeChild(node.firstChild);
    }
  };

  this._recenter = function() {
    // stretch overlay to fill page and fade in
    var pageSizeArray = getPageSize();
    var pageWidth = pageSizeArray[0];
    var pageHeight = pageSizeArray[1];
    var windowWidth = pageSizeArray[2];
    var windowHeight = pageSizeArray[3];
    this.overlay.setWidth(pageWidth);
    this.overlay.setHeight(pageHeight);

    // calculate top and left offset for the lightbox 
    var pageScrollArray = getPageScroll();
    var xScroll = pageScrollArray[0];
    var yScroll = pageScrollArray[1];
    var lightboxTop = yScroll + (windowWidth / 10);
    this.lightbox.setTop(lightboxTop);
    this.lightbox.setLeft(xScroll);
  };

  this._observePage = function(evt) {

    this._boundResizeHandler = this._windowResizeHandler.bindAsEventListener(this);
    this._boundScrollHandler = this._windowScrollHandler.bindAsEventListener(this);

    Event.observe(window, 'resize', this._boundResizeHandler);
    Event.observe(window, 'scroll', this._boundScrollHandler);
  };

  this._stopObservingPage = function(evt) {

    Event.stopObserving(window, 'resize', this._boundResizeHandler);
    Event.stopObserving(window, 'scroll', this._boundScrollHandler);
  };

  this._windowResizeHandler = function(evt) {    
    this._recenter();
  };

  this._windowScrollHandler = function(evt) {    
    this._recenter();
  };

  // Prevent any clicks on the overlay from getting to content below.
  this._overlayHandler = function(evt) {
    Event.stop(evt);
  };

  this._lightboxHandler = function(evt) {
    Event.stop(evt);
  };
}

/**
 *  The Wizard object extends Dialog to add functions for navigating between pages
 *  and managing the progression.
 */
var Wizard = new Object();

Object.extend(Wizard, Dialog);

Object.extend(Wizard, {
  pages: 0
});

/**
 *  Returns the page scroll, x and y, in an array.
 *  Core code from - quirksmode.com
 *
 *  @return Array Page scroll in an array.
 */
function getPageScroll() {
  var xScroll, yScroll;

  if (self.pageYOffset)
  {
    yScroll = self.pageYOffset;
    xScroll = self.pageXOffset;
  } else if (document.documentElement && document.documentElement.scrollTop){   // Explorer 6 Strict
    yScroll = document.documentElement.scrollTop;
    xScroll = document.documentElement.scrollLeft;
  } else if (document.body) {// all other Explorers
    yScroll = document.body.scrollTop;
    xScroll = document.body.scrollLeft;  
  }

  return new Array(xScroll,yScroll);
}

/**
 *  Returns the page and window size, height and width, in an array.
 *  Core code from - quirksmode.com
 *  Edit for Firefox by pHaez
 *
 *  @return Array Page and window measurements in an array.
 */
function getPageSize() {
   var xScroll, yScroll;

   if (window.innerHeight && window.scrollMaxY) {  
     xScroll = window.innerWidth + window.scrollMaxX;
     yScroll = window.innerHeight + window.scrollMaxY;
   } else if (document.documentElement) { // IE 6/7 in strict mode 
     xScroll = document.documentElement.scrollWidth;
     yScroll = document.documentElement.scrollHeight;
   } else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
     xScroll = document.body.scrollWidth;
     yScroll = document.body.scrollHeight;
   } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
     xScroll = document.body.offsetWidth;
     yScroll = document.body.offsetHeight;
   }

   var windowWidth, windowHeight;
   var pageWidth, pageHeight;

   if (self.innerHeight) {  // all except Explorer
     if(document.documentElement.clientWidth){
       windowWidth = document.documentElement.clientWidth; 
     } else {
       windowWidth = self.innerWidth;
     }
     windowHeight = self.innerHeight;
   } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
     windowWidth = document.documentElement.clientWidth;
     windowHeight = document.documentElement.clientHeight;
   } else if (document.body) { // other Explorers
     windowWidth = document.body.clientWidth;
     windowHeight = document.body.clientHeight;
   }  

   // for small pages with total height less then height of the viewport
   if(yScroll < windowHeight){
     pageHeight = windowHeight;
   } else { 
     pageHeight = yScroll;
   }

   // for small pages with total width less then width of the viewport
   if(xScroll < windowWidth){  
     pageWidth = xScroll;    
   } else {
     pageWidth = windowWidth;
   }

   return new Array(pageWidth,pageHeight,windowWidth,windowHeight);
}

/* Cookie stuff */
function getCookie( name ) {
	var start = document.cookie.indexOf( name + "=" );
	var len = start + name.length + 1;
	if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
		return null;
	}
	if ( start == -1 ) return null;
	var end = document.cookie.indexOf( ';', len );
	if ( end == -1 ) end = document.cookie.length;
	return unescape( document.cookie.substring( len, end ) );
}

function setCookie( name, value, expires, path, domain, secure ) {
	var today = new Date();
	today.setTime( today.getTime() );
	if ( expires ) {
		expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );
	document.cookie = name+'='+escape( value ) +
		( ( expires ) ? ';expires='+expires_date.toGMTString() : '' ) + //expires.toGMTString()
		( ( path ) ? ';path=' + path : '' ) +
		( ( domain ) ? ';domain=' + domain : '' ) +
		( ( secure ) ? ';secure' : '' );
}

function deleteCookie( name, path, domain ) {
	if ( getCookie( name ) ) document.cookie = name + '=' +
			( ( path ) ? ';path=' + path : '') +
			( ( domain ) ? ';domain=' + domain : '' ) +
			';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}

/* IE doesnt come with Array:forEach, add it here. */
if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
  };
}

/* AV Windows functionality */

var AV = {
	
  onclick: function(el) {
    if ($('click_status').value == 'none') {
      $('click_status').value = el.id;
      $('first_element').value = el.className;
      el.className = 'selected_av_block';
    }
    else {
      $('edit_alert').show();
      $('window_form_container').show();
      $('bitmap').value = this.apply($('bitmap').value, $('click_status').value, el.id);
      this.draw_window($('bitmap').value);
      $('click_status').value = 'none';
      $('first_element').value = 'none';
    }
  },

  draw_window: function(bm) {
    for (i=0; i<336; i++) {
      if (bm.charAt(i) == '1') {
       $('segment_'+i).className = 'occupied_av_block';
      }
      else {
       $('segment_'+i).className = 'empty_av_block';
      }
    }
  },

  apply: function(bm, ind1, ind2) {
    // 01234567###
    // segment_###
    var result = "";
    var l = Math.floor(Math.min(parseInt(ind1.substring(8)) % 48, parseInt(ind2.substring(8)) % 48));
    var r = Math.floor(Math.max(parseInt(ind1.substring(8)) % 48, parseInt(ind2.substring(8)) % 48));
    var b = Math.floor(Math.min(parseInt(ind1.substring(8)) / 48, parseInt(ind2.substring(8)) / 48));
    var t = Math.floor(Math.max(parseInt(ind1.substring(8)) / 48, parseInt(ind2.substring(8)) / 48));
    var deleting = ($('first_element').value == 'occupied_av_block');
    for (var i=0; i<336; i++) {
      if ((l <= (i%48)) && ((i%48) <= r) && (b <= Math.floor(i/48)) && (Math.floor(i/48) <= t)) {
        if (deleting) {
          result += '0';
        }
        else {
          result += '1';
        }
      }
      else {
        result += bm.charAt(i);
      }
    }
    return result;
  },


 save: function() {
    var f = $('av_window');
    new Ajax.Request('/library/save_windows', {
						asynchronous: true, 
						evalScripts: true, 
						parameters:Form.serialize(f)});
    $('window_form_container').hide();
    $('edit_alert').hide();
  },

  cancel: function() {
    new Ajax.Request('/library/cancel_windows', {
						asynchronous: true, 
						evalScripts: true});
    this.draw_window($('bitmap').value);
    $('window_form_container').hide();
    $('edit_alert').hide();
  }	
}

/*
  Enhanced version of EventObserver that will fire even if you re-select the same element
  in a pulldown.
*/
Abstract.SelectEventObserver = Class.create(Abstract.EventObserver, {
  onElementEvent: function() {
    var value = this.getValue();
    this.callback(this.element, value, this);
  }
});

Form.Element.SelectEventObserver = Class.create(Abstract.SelectEventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

/* end AV windows */

/* central manager zones */

var rcm = {
  openInfoWindow: null,
  
  verifyDrop: function(draggable, droppable)
  {
    var drags = draggable.id.split("_");
    var drops = droppable.id.split("_");
    var params = "with="+drags.last();
    new Ajax.Request("/zones/update/"+drops.last(), 
                     { asynchronous: true, 
                       evalScripts: true, 
                       parameters: params });
    return false;
  },

  selectAll: function(level)
  {
    var a = $A($('alert_config').getElementsBySelector('[class='+level+']'));
    a.each(function(el) {
      el.checked =  true;
    });
  },
  
  createMap: function(map_id, rect, zoom) {
    var se = new google.maps.LatLng(rect.first().first(), rect.first().last());
    var nw = new google.maps.LatLng(rect.last().first(), rect.last().last());
    var bounds = new google.maps.LatLngBounds(se, nw);
    var latlng = bounds.getCenter();
    var myOptions = {
      zoom: zoom,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false
    };
    var map = new google.maps.Map(document.getElementById(map_id), myOptions);
    google.maps.event.addListener(map, 'click', function() { rcm.closeOpenInfoWindow() });
    return map;
  },

  createMarker: function(map, lat, lng, color, title) {
    var loc = new google.maps.LatLng(lat, lng);
    var imagePath = "/images/" + color + "-flag-32x32.gif";
    var image = new google.maps.MarkerImage(imagePath,
      new google.maps.Size(32, 32),
      new google.maps.Point(0, 0),
      new google.maps.Point(13, 31)
    );
    // shadowPath = "/images/shadow-flag-32x32.png";
    // var shadow = new google.maps.MarkerImage(shadowPath,
    //   new google.maps.Size(45, 20),
    //   new google.maps.Point(0, 0), 
    //   new google.maps.Point(4,20)
    // );
    var options = {
      map: map,
      position: loc,
      title: title,
      clickable: true,
      flat: false,
      // shadow: shadow,
      icon: image
    };
    var marker = new google.maps.Marker(options);
    return marker;
  },

  closeOpenInfoWindow: function() {
    if (rcm.openInfoWindow) {
      rcm.openInfoWindow.close();
    }
  },

  addInfoWindow: function(map, marker, content, id) {
    var infowindow = new google.maps.InfoWindow({
      content: content,
      maxWidth: 420
    });
    google.maps.event.addListener(marker, 'click', function() {
      rcm.closeOpenInfoWindow();
      infowindow.open(map, marker);
      rcm.openInfoWindow = infowindow;
    });
    google.maps.event.addListener(marker, 'dblclick', function() {
      window.location = basePath("library", "index") + id;
    });
  },

  overlayGrid: function(map) {
    var colors = ['red', 'green', 'yellow'];
    var idx = 0;
    for (var lat=-0.5; lat <=0.5; lat+=0.1) {
      for(var lng=-2.0; lng<=2.0; lng+=0.1) {
        var marker = createMarker(map, lat, lng, colors[idx], ""+lat+" : "+lng);
      }
      idx++;
      if (idx == 3)
        idx = 0;
    }
  },
  
  toggleSystemMessages: function(link) {
  	var new_text, effect;
    if (link.text == 'View') {
      new_text = 'Hide';
      effect = 'slide_down';
    } else {
      new_text = 'View';
      effect = 'slide_up';
    }
    $('messages_container').visualEffect(effect, {duration: 0.2});
    link.innerHTML = new_text;
  },

  addReportToDashboard: function(draggable, report_id) {
    var drags = draggable.id.split("_");
    var path = "/reports/update/"+report_id;
    var params = "with="+drags.last();
    new Ajax.Request(path, 
                     { asynchronous: true, 
                       evalScripts: true, 
                       parameters: params });
    return false;
  },

  runUnlessDragging: function(id) {
    var el = $('report_'+id);
    if (el.dragging) {
      el.dragging = false;
    } else {
      var path = "/reports/report/" + id;
      new Ajax.Request(path,
                       { asynchronous: true,
                         evalScripts: true });
      return false;
    }
  } 
};

/* end rcm zones */

/* rcm alert tooltips */

var alertTips = {
  lastDisplayedAlertCountId: null,
  hideTimerId:               $A(new Array()),
  displayTimerId:            $A(new Array()),

  cancelEffects: function(id) {
    Effect.Queue.each(function(effect) { 
      if (effect.element.id == id) {
        effect.cancel();
      }
    });    
  },

  displayAlertCounts: function (zone_id) {
    this.lastDisplayedAlertCountId = zone_id;
    this.cancelEffects('zone_'+zone_id+'_alerts');
    this.displayTimerId.push(setTimeout('alertTips.delayedDisplay()', 1000));
  },

  delayedDisplay: function(zone_id) {
    this.setAbsolutePosition(this.lastDisplayedAlertCountId);
  
    var el = $( 'zone_' + this.lastDisplayedAlertCountId + '_alerts' );
    el.visualEffect('appear', {duration: 0.3}); 
    this.hideTimerId.push(setTimeout('alertTips.hideAlertCounts()', 5000));
  },

  setAbsolutePosition: function(id) {
    var el = $( 'zone_' + id + '_alerts' );
    var pel = $( 'zone_' + id );
    var position = this.getPosition( pel );
    var lpos = String( position.x + ( pel.getWidth() - 45 ) );
    var offset = ( pel.getHeight() - el.getHeight() ) / 2;
    var tpos = String(position.y -4);
    el.setStyle("left:" + lpos + "px;top:" + tpos + "px");
  },

  cancelAlertCountDisplay: function() {
    if (this.displayTimerId.size() > 0)
    {
      this.displayTimerId.each(function(id) {
        clearTimeout(id);
      });
      this.displayTimerId.clear();
    }
  },

  hideAlertCounts: function(zone_id) {
    if (zone_id == null)
    {
      zone_id = this.lastDisplayedAlertCountId;
    }
    if (zone_id == null)
    {
      return;
    }
    this.lastDisplayedAlertCount = null;
    this.cancelAlertCountDisplay();
    if (this.hideTimerId.size() > 0)
    {
      this.hideTimerId.each(function(id) {
        clearTimeout(id);
      });
      this.hideTimerId.clear();
    }
    this.cancelEffects('zone_'+zone_id+'_alerts');
    $('zone_'+zone_id+'_alerts').visualEffect('fade', {duration: 0.3});
  },

  getPosition: function(el) {
    var obj = $(el);
    var x = y = 0;
    if (obj.offsetParent) {
      do {
        x += obj.offsetLeft;
        y += obj.offsetTop;
      } while(obj = obj.offsetParent);
    }  
    return {x: x, y: y};
  }
};

/* end rcm alert tooltips */

function hide_clear_status(e) {
  var first = $(e).select('.clear_status').first();
  if(first != null) {
     first.hide()
  }
}
function show_clear_status(e) {
  var first = $(e).select('.clear_status').first();
  if(first != null) {
     first.show()
  }
}

/* for handling the rva menu ribbons */

var ribbon = {
  currentOptionList: null,
  revertTimeout: 3000,
  activeJumpMenuElement: null,
  activeJumpMenuHelper: null,
  
  init: function() {
    this.revert_to_menu = this.findSelectedMenuItem();
    this.revert_to_options = this.findDisplayedOptionsList();
    this.revert_to_library_block = this.findDisplayedLibraryBlock();
  },
  
  setActiveJumpMenuHelper: function(helper, element) {
    this.activeJumpMenuElement = element;
    this.activeJumpMenuHelper = helper;
  },
  
  clearActiveJumpMenuHelper: function() {
    this.activeJumpMenuElement = null;
  },
  
  selectAndDisplayOptions: function(menu, options_id) {
    if(this.revertTimer) {
      clearTimeout(this.revertTimer);
    }
    var options_list = $(options_id+'_options');
    $$(".ribbon .selected").each(function(s) {
      s.removeClassName('selected');
    });

    menu.addClassName('selected');
    if (this.currentOptionList == null) {
      this.currentOptionList = this.revert_to_options.parentNode;
    }
    if (this.currentOptionList && (this.currentOptionList != options_list)) {
      this.currentOptionList.hide();
    }
    options_list.show();
    options_list.childElements().first().show();
    this.currentOptionList = options_list;
    this.positionOptions(options_id, menu);
    var parts = menu.id.split('_');
    if (parts.length > 1) {
      setCookie("current_connection_id", parts[1], 3000, '/', '', '');
    }
    if (!this.reverting) {
      this.startRevert();
    }
  },
  
  startRevert: function() {
    this.revertTimer = setTimeout("ribbon.revert()", this.revertTimeout);
  },
  
  revert: function() {
    this.reverting = true;
    var delay = this.displayRibbonBlock(this.revert_to_library_block.id.split('_').last());
    setTimeout(function() {
      ribbon.delayedDisplay();
    }, delay*3);
  },
  
  delayedDisplay: function() {
    if ($(this.revert_to_menu.parentNode).visible() == true) {
      if (this.activeJumpMenuElement && this.activeJumpMenuHelper) {
        this.activeJumpMenuHelper.hide(this.activeJumpMenuElement);
      }
      this.selectAndDisplayOptions(this.revert_to_menu, this.revert_to_options.id.split("_").first());
      this.reverting = false;
    } else {
      setTimeout(function(){
        ribbon.delayedDisplay();
      }, 1000);
    }
  },
  
  resetTimeout: function() {
    if(ribbon.revertTimer) {
      clearTimeout(ribbon.revertTimer);
      ribbon.startRevert();
    }
  },
  
  requestPage: function(conn_id, params, remote) {
    if(this.revertTimer) {
      clearTimeout(this.revertTimer);
    }
    var url = "/" + params.controller + "/" + params.action + "?new_connection_id=" + conn_id;
    $H(params).each(function(pair) {
      var k = pair.first();
      var v = pair.last();
      if (! $A(['controller', 'action', 'new_connection_id']).include(k) ) {
        if (v.constructor == String) 
          url += ("&" + k + "=" + v); 
        else 
          $H(v).each(function(nestedPair) { 
            url += ("&" + k + "["+nestedPair[0]+"]=" + nestedPair[1]); 
          });    
      }
    });
    if(remote) {
      new Ajax.Request(url, {asynchronous:true, evalScripts:true});
    } else {
      window.location = url;
    }
    return false;
  },
  
  getPosition: function(el) {
    var obj = $(el);
    var x = y = 0;
    if (obj.offsetParent) {
      do {
        x += obj.offsetLeft;
        y += obj.offsetTop;
      } while(obj = obj.offsetParent);
    } else {
      x = obj.offsetLeft;
      y = obj.offsetTop;
    }
    return {x: x, y: y};
  },    
  
  positionOptions: function(options_id, relative_to) {
    var item;
    var list;
    if (options_id) {
      list = $(options_id+"_options_list");
    } else {
      list = this.findDisplayedOptionsList();
    }
    if (options_id) {
      item = $(relative_to);
    } else {
      item = this.findSelectedMenuItem();
    }
    if (list == null || item == null) {
      return;
    }
    var cPos = ribbon.getPosition(item);
    var cWidth = item.getWidth();
    var lPos = ribbon.getPosition(list);
    var lWidth = list.getWidth();
    var offset = (lWidth - cWidth) / 2;
    var x = cPos.x - offset;
    var maxWidth = list.offsetParent.getWidth();
    var style = 'right:auto; left:' + (x-2) + "px";
    if (x + lWidth > (maxWidth-52)) {
      x = maxWidth - (lWidth + 52);
      style = "left:auto; right:0px";
    }
    if (x < 25) {
      style = "right:auto; left:25px"
    }
    list.setStyle("position:absolute;"+style);
  },
  
  findDisplayedOptionsList: function() {
    var div = $('ribbon_container').getElementsBySelector('div.nav_options').detect(
      function(e) {
        return e.getStyle("display") != 'none';
      }
    );
    if (div == null) {
      return null;
    } else {
      return div.childElements().first();
    }
  },
  
  findDisplayedLibraryBlock: function() {
    return $$(".ribbon div.block").detect(
      function(b) {
        return b.visible() == true;
      }
    );
  },

  // hide and shows the ribbon blocks
  displayRibbonBlock: function(index) {
    if(this.revertTimer) {
      clearTimeout(this.revertTimer);
    }
    var block_to_display = "block_" + index
    var sleep = 0;
    $$('.ribbon div.block').each(function(block) {
      if((block.visible() == true) && (block.id != block_to_display)) {
        sleep += 0.3;
        block.visualEffect('fade', {duration: 0.3, queue: 'front' });
      }
      else if (block.id == block_to_display) { 
        sleep += 0.3;
        block.visualEffect('appear', {duration: 0.3, queue: 'end'});
      }
    });

    // hide/show the library menu if tabbing between libraries
    var has_selected_library = $(block_to_display).select('.selected').size() != 0
    library_menu = $('library_options').childElements().first()
    if (has_selected_library || this.reverting) {
      sleep += 0.3;
      library_menu.visualEffect('appear', {duration: 0.3});
    }
    else {
      sleep += 0.3;
      library_menu.visualEffect('fade', {duration: 0.3});
    }
    
    if (!this.reverting && this.revert_to_options.id.startsWith("library")) {
      this.startRevert();
    } else if (! this.revert_to_options.id.startsWith("library")) {
      this.revert_to_library_block = $(block_to_display);
    }
    return sleep;
  },
  
  findSelectedMenuItem: function() {
    return $$('.ribbon div.tab').detect(
      function(s) {
        return s.hasClassName('selected');
      }
    );
  }
};

/* end rva menu ribbons */


/* Replication Windows functionality */

var RP = {
	
  onclick: function(el) {
    if ($('click_status').value == 'none') {
      $('click_status').value = el.id;
      $('first_element').value = el.className;
      el.className = 'selected_rp_block';
    }
    else {
      $('edit_alert').show();
      $('window_form_container').show();
      $('bitmap').value = this.apply($('bitmap').value, $('click_status').value, el.id);
      this.draw_window($('bitmap').value);
      $('click_status').value = 'none';
      $('first_element').value = 'none';
    }
  },

  draw_window: function(bm) {
    for (i=0; i<336; i++) {
      if (bm.charAt(i) == '1') {
       $('segment_'+i).className = 'occupied_rp_block';
      }
      else {
       $('segment_'+i).className = 'empty_rp_block';
      }
    }
  },

  apply: function(bm, ind1, ind2) {
    // 01234567###
    // segment_###
    result = "";
    l = Math.floor(Math.min(parseInt(ind1.substring(8)) % 48, parseInt(ind2.substring(8)) % 48));
    r = Math.floor(Math.max(parseInt(ind1.substring(8)) % 48, parseInt(ind2.substring(8)) % 48));
    b = Math.floor(Math.min(parseInt(ind1.substring(8)) / 48, parseInt(ind2.substring(8)) / 48));
    t = Math.floor(Math.max(parseInt(ind1.substring(8)) / 48, parseInt(ind2.substring(8)) / 48));
    deleting = ($('first_element').value == 'occupied_rp_block');
    for (i=0; i<336; i++) {
      if ((l <= (i%48)) && ((i%48) <= r) && (b <= Math.floor(i/48)) && (Math.floor(i/48) <= t)) {
        if (deleting) {
          result += '0';
        }
        else {
          result += '1';
        }
      }
      else {
        result += bm.charAt(i);
      }
    }
    return result;
  },


 save: function() {
    var f = $('rp_window');
    new Ajax.Request('/replication/save_windows', {
						asynchronous: true, 
						evalScripts: true, 
						parameters:Form.serialize(f)});
    $('window_form_container').hide();
    $('edit_alert').hide();
  },

  cancel: function() {
    new Ajax.Request('/replication/cancel_windows', {
						asynchronous: true, 
						evalScripts: true});
    this.draw_window($('bitmap').value);
    $('window_form_container').hide();
    $('edit_alert').hide();
  }	
}

/*
  Enhanced version of EventObserver that will fire even if you re-select the same element
  in a pulldown.
*/
Abstract.SelectEventObserver = Class.create(Abstract.EventObserver, {
  onElementEvent: function() {
    var value = this.getValue();
    this.callback(this.element, value, this);
  }
});

Form.Element.SelectEventObserver = Class.create(Abstract.SelectEventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

/* end Replication windows */
