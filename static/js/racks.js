
var REFRESH_TIME = 60000;
var serverIPToJoyentNameMap = {
  "10.245.112.1": "r2-410-1.",
  "10.245.112.2": "r2-410-2.",
  "10.245.112.3": "r2-410-3.",
  "10.245.112.4": "r2-410-4.",
  "10.245.112.5": "r2-410-5.",
  "10.245.112.6": "r2-410-6.",
  "10.245.112.7": "r2-410-7.",
  "10.245.112.8": "r2-610-1",
  "10.245.112.9": "r2-610-2",
  "10.245.112.10": "r2-710-1",
  "10.245.112.11": "r2-710-2",
  "10.245.112.12": "r2-710-3",
  "10.245.112.13": "r2-710-4",
  "10.245.112.14": "r2-710-5",
  "10.245.112.15": "r2-710-6",
  "10.245.112.16": "r2-710-7",
  "10.245.112.17": "headnode",
  "10.245.112.20": "r2-910-1",
  "10.245.113.1": "r3-410-1.",
  "10.245.113.2": "r3-410-2.",
  "10.245.113.3": "r3-410-3.",
  "10.245.113.4": "r3-410-4.",
  "10.245.113.5": "r3-410-5",
  "10.245.113.7": "r3-610-2",
  "10.245.113.8": "r3-610-3",
  "10.245.113.9": "r3-610-4",
  "10.245.113.10": "r3-710-1.",
  "10.245.113.12": "r3-710-3",
  "10.245.113.15": "r3-710-6",
  "10.245.113.16": "r3-710-7",
  "10.245.113.17": "r3-710-8",
  "10.245.113.18": "r3-910-1",
  "10.245.115.1": "r5-x3550-1",
  "10.245.115.2": "r5-3550-2",
  "10.245.115.3": "r5-x3550-3",
  "10.245.115.4": "r5-3550-4"
}

var serverIPToOpenStackNameMap = {
  "10.245.111.1": "r1-610-1",
  "10.245.111.2": "r1-610-2",
  "10.245.111.3": "r1-610-3",
  "10.245.111.4": "r1-610-4",
  "10.245.111.5": "r1-710-1",
  "10.245.111.6": "r1-710-2",
  "10.245.111.7": "r1-710-3",
  "10.245.111.8": "r1-710-4",
  "10.245.111.9": "r1-710-5",
  "10.245.111.10": "r1-910-1",
  "10.245.114.4": "r4-410-4",
  "10.245.114.5": "r4-410-5",
  "10.245.114.9": "r4-610-4"
}

$(document).ready( function()  {

  // Check each node and configure for display of Error, Joyent Data Dialog, Joyent SM_VM Dialog and Joyent LOGO Display.
  $(".node").each(function(index,ele){
    $(ele).click(showError);
    $('body').append('<div id="dialog_joyent_'+$(ele).attr("id")+'" title="<div class=dialog_title>Joyent</div>" class="ipmi_cmd"></div>');
    $('body').append('<div id="dialog_joyent_SM_VM_'+$(ele).attr("id")+'" title="<div class=dialog_title>Joyent</div>" class="ipmi_cmd"></div>');
    var ip = ($(ele).attr("id")).replace(/_/g, ".");
    if (serverIPToJoyentNameMap[ip]) {
      $(ele).addClass('joyent');
    }
    if (serverIPToOpenStackNameMap[ip]) {
      $(ele).addClass('openstack');
    }
  });

  // Context Menu info for every node
  rightClick();

  // Reset the Power Status display icon
  $("img[src$='power_off.png']").css("display", "none");

  // Display Power status tool tip of server if it is turned off
  $(document).tooltip({ 
    position: {
      my: "left top+4"
    }, 
    tooltipClass: "tooltip"
  });

  // Get the IPMI Server Status.
  getServerStatus();
  nextRefreshCountdown("refresh_time", 0, REFRESH_TIME/1000);  

  // Now get the Status of the servers (Query the Web Server) every REFRESH_TIME/1000 seconds.
  setInterval(function() 
  {
    getServerStatus();
    nextRefreshCountdown("refresh_time", 0, REFRESH_TIME/1000);  
  }, REFRESH_TIME);
});

function showError(eve) {
  var ele_id = "#" + eve.target.id;
  if ($(ele_id).hasClass("error") || $(ele_id).hasClass("warning")) {
    $(ele_id).find(".node_error").toggle();
  }
}

function rightClick()
{
  // Set poperties for Dialog context menu.
  $(".ipmi_cmd").dialog({ autoOpen: false, show: "blind", hide: "explode" });

  $.contextMenu({
    selector: ".node",
    className: 'menu-title',
    build: function($trigger, e) {
		  return {
        callback: function() {},
        items: {
          sep1: "--------", 
          title: { name: ($trigger.attr("id")).replace(/_/g, ".")+" Web Management", callback: function(key, opt) {
                     var myIP = ($trigger.attr("id")).replace(/_/g, ".");
	                   window.open('http://'+myIP, myIP+' Web Management', 'height=800,width=800');
                }},
          sep2: "--------",
          //Sensor Commands:  list thresh get reading
          sensor: { 
            name: "sensor", 
            items: {
              list:{ name: "list", callback: function(key, opt){ 
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["sensor",key]}); }},
              get:{ 
                name: "get", 
                items: {
                  Temperature: { name: "Temperature", callback: function(key, opt){
                    execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["sensor","list |grep \"Temp\" |cut -d'|' -f 2 |grep -v na"]}); }},
                  Voltage: { name: "Voltage", callback: function(key, opt){
                    execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["sensor","list |grep \"Voltage\" |cut -d'|' -f 2 |grep -v na"]}); }},
                  Current: { name: "Current", callback: function(key, opt){
                    execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["sensor","list |grep \"Current\" |cut -d'|' -f 2 |grep -v na"]}); }},
                  System: { name: "System", callback: function(key, opt){
                    execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["sensor","list |grep \"System\" |cut -d'|' -f 2 |grep -v na"]}); }}
                }
              }
            }
          },
          //chassis power Commands: status, on, off, cycle, reset, diag, soft
          power: {
            name: "power", 
            items: {
              status:{ name: "status", callback: function(key, opt){
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["power",key]}); }},
              on:{ name: "on", callback: function(key, opt){
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["power",key]}); }},
              off:{ name: "off", callback: function(key, opt){
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["power",key]}); }},
              cycle:{ name: "cycle", callback: function(key, opt){
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["power",key]}); }},
              reset:{ name: "reset", callback: function(key, opt){
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["power",key]}); }},
              diag:{ name: "diag", callback: function(key, opt){
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["power",key]}); }},
              soft:{ name: "soft", callback: function(key, opt){
                execIPMICommand({"IP":opt.$trigger.attr("id"),"ipmi_parms": ["power",key]}); }},
            }
          },
          sep2: "--------",
          JoyentInfo: {
            name: "JoyentInfo", 
              callback: function(key, opt) {
                var ip = (opt.$trigger.attr("id")).replace(/_/g, ".");
                if (serverIPToJoyentNameMap[ip] === "headnode") {
                  getJoyentHeadNodeData(opt.$trigger.attr("id"), ip);
                } else {
                  getJoyentData(opt.$trigger.attr("id"), ip); 
                }
              },
              disabled: function(key, opt) {
                var ip = (opt.$trigger.attr("id")).replace(/_/g, ".");
                if (serverIPToJoyentNameMap[ip] == undefined) { return true; }
              }
          }
        }
      };
    }
  });
}

function getSMVMInfo(uuid, alias, owner, owner_uuid, dataset, dataset_uuid, type, id)
{
  var machineType;
  if (type == "SM") { machineType = "zones"; }
  if (type == "VM") { machineType = "vms"; }
  $('#'+uuid).css("background-image", "url('images/ProgressIndicator.gif')");
  $('#'+uuid).css("width", "20px");
  $('#'+uuid).css("height", "20px");
  $('#'+uuid).css("position", "relative");
  $('#'+uuid).css("background-repeat", "no-repeat");
  $('#'+uuid).css("background-position", "left");
  $.getJSON('http://10.245.122.1:3000/get-zone-vm-info', uuid + " " + type, function(data) {
    var zone_vm_usage = "<table style=\"width:90%\">";
    zone_vm_usage += "<tr><td>" + "Type: </td><td>" +
											"<a href=\"https://10.245.122.2/ICSR/"+machineType+"?destroyed=false\" target=\"_blank\">" +
                      type + 
                      "</a></td></tr><tr><td>" + "Owner: </td><td>" +
											"<a href=\"https://10.245.122.2/customers/"+owner_uuid+"\" target=\"_blank\">" +
                      owner +  
                      "</a></td></tr><tr><td>" + "IP Address: </td><td>" +
											"<a href=\"https://10.245.122.2/ICSR/"+machineType+"/"+uuid+"\" target=\"_blank\">" +
                      data.ip +  
                      "</a></td></tr><tr><td>" + "UUID: </td><td>" +
											"<a href=\"https://10.245.122.2/ICSR/"+machineType+"/"+uuid+"\" target=\"_blank\">" +
                      uuid +  
                      "</a></td></tr><tr><td>" + "Alias: </td><td>" +
											"<a href=\"https://10.245.122.2/ICSR/"+machineType+"/"+uuid+"\" target=\"_blank\">" +
                      alias +  
                      "</a></td></tr><tr><td>" + "Dataset: </td><td>" +
											"<a href=\"https://10.245.122.2/ICSR/datasets/"+dataset_uuid+"\" target=\"_blank\">" +
                      dataset +  
                      "</a></td></tr>";
    zone_vm_usage += "</table>";
    $("#dialog_joyent_SM_VM_"+id).html(zone_vm_usage);
    $("#dialog_joyent_SM_VM_"+id).dialog( "option", "title", "<div class=\"dialog_title\">Joyent Usage for "+type+ " with UUID: ["+uuid+"]</div>");
    $("#dialog_joyent_SM_VM_"+id).dialog( "option", "minWidth", 700 );
    $("#dialog_joyent_SM_VM_"+id).dialog( "option", "position", { my: "bottom", at: "center", of: "#dialog_joyent_"+id });
    $("#dialog_joyent_SM_VM_"+id).dialog( "open" );

    $('#'+uuid).css("background-image", "");
  });
}

function getJoyentHeadNodeData(id, serverIP)
{
  $.getJSON('http://10.245.122.1:3000/get-joyent-data', function(data) {

    var server_usage = "<table style=\"width:90%\">";
    server_usage += "<tr><th colspan=\"5\">Smart Machines</th></tr>";
    for (server in data) {
    for (i in data[server].sm) {
      var onclick_parms = "\"getSMVMInfo('"+ data[server].sm[i].uuid + "','" + data[server].sm[i].zone_alias + "','" +
                                             data[server].sm[i].owner + "','" + data[server].sm[i].owner_uuid + "','" + 
                                             data[server].sm[i].dataset + "','" + data[server].sm[i].dataset_uuid + "','" +
                                             "SM', '" + id + "');\"" ;
      server_usage += "<tr><td id=\""+data[server].sm[i].uuid+"\"></td>";
      server_usage += "<td><a href=\"javascript:void(0)\" onclick=" + onclick_parms + ">" + 
                      data[server].sm[i].zone_alias + 
                      "</a></td><td><a href=\"https://10.245.122.2/customers/"+data[server].sm[i].owner_uuid+"\" target=\"_blank\">" + 
                      data[server].sm[i].owner + 
                      "</a></td><td><a href=\"https://10.245.122.2/ICSR/datasets/"+data[server].sm[i].dataset_uuid+"\" target=\"_blank\">" + 
                      data[server].sm[i].dataset + 
                      "</a></td><td>" +
                      data[server].server_name +
                      "</td></tr>";
    }
    }
    server_usage += "<tr><th colspan=\"5\">Virtual Machines</th></tr>";
    for (server in data) {
    for (i in data[server].vm) {
      var onclick_parms = "\"getSMVMInfo('"+ data[server].vm[i].uuid + "','" + data[server].vm[i].zone_alias + "','" +
                                             data[server].vm[i].owner + "','" + data[server].vm[i].owner_uuid + "','" + 
					                                   data[server].vm[i].dataset + "','" + data[server].vm[i].dataset_uuid + "','" +
                                             "VM', '" + id + "');\"" ;
      server_usage += "<tr><td id=\""+data[server].vm[i].uuid+"\"></td>";
      server_usage += "<td><a href=\"javascript:void(0)\" onclick=" + onclick_parms + ">" + 
                      data[server].vm[i].vm_alias + 
                      "</a></td><td><a href=\"https://10.245.122.2/customers/"+data[server].vm[i].owner_uuid+"\" target=\"_blank\">" + 
                      data[server].vm[i].owner + 
                      "</a></td><td><a href=\"https://10.245.122.2/ICSR/datasets/"+data[server].vm[i].dataset_uuid+"\" target=\"_blank\">" + 
                      data[server].vm[i].dataset + 
                      "</a></td><td>" +
                      data[server].server_name +
                      "</td></tr>";
    }
    }
    server_usage += "</table>";

    $("#dialog_joyent_"+id).html(server_usage);
    $("#dialog_joyent_"+id).dialog( "option", "title", "<div class=\"dialog_title\">Total Joyent Usage</div>");
    $("#dialog_joyent_"+id).dialog( "option", "minWidth", 770 );
    $("#dialog_joyent_"+id).dialog( "open" );
  });
}

function getJoyentData(id, serverIP)
{
  var serverJoyentName = serverIPToJoyentNameMap[serverIP];
  $.getJSON('http://10.245.122.1:3000/server-usage', serverJoyentName, function(data) {

    var server_usage = "<table style=\"width:90%\">";
    server_usage += "<tr><th colspan=\"3\">Smart Machines - ["+data.sm.length+"]</th></tr>";
    for (i in data.sm) {
      var onclick_parms = "\"getSMVMInfo('"+ data.sm[i].uuid + "','" + data.sm[i].zone_alias + "','" +
                                             data.sm[i].owner + "','" + data.sm[i].owner_uuid + "','" + 
                                             data.sm[i].dataset + "','" + data.sm[i].dataset_uuid + "','" +
                                             "SM', '" + id + "');\"" ;
      server_usage += "<tr><td id=\""+data.sm[i].uuid+"\"></td>";
      server_usage += "<td><a href=\"javascript:void(0)\" onclick=" + onclick_parms + ">" + 
                      data.sm[i].zone_alias + 
                      "</a></td><td><a href=\"https://10.245.122.2/customers/"+data.sm[i].owner_uuid+"\" target=\"_blank\">" + 
                      data.sm[i].owner + 
                      "</a></td><td><a href=\"https://10.245.122.2/ICSR/datasets/"+data.sm[i].dataset_uuid+"\" target=\"_blank\">" + 
                      data.sm[i].dataset + 
                      "</a></td></tr>";
    }
    server_usage += "<tr><th colspan=\"3\">Virtual Machines - ["+data.vm.length+"]</th></tr>";
    for (i in data.vm) {
      var onclick_parms = "\"getSMVMInfo('"+ data.vm[i].uuid + "','" + data.vm[i].zone_alias + "','" +
                                             data.vm[i].owner + "','" + data.vm[i].owner_uuid + "','" + 
					                                   data.vm[i].dataset + "','" + data.vm[i].dataset_uuid + "','" +
                                             "VM', '" + id + "');\"" ;
      server_usage += "<tr><td id=\""+data.vm[i].uuid+"\"></td>";
      server_usage += "<td><a href=\"javascript:void(0)\" onclick=" + onclick_parms + ">" + 
                      data.vm[i].vm_alias + 
                      "</a></td><td><a href=\"https://10.245.122.2/customers/"+data.vm[i].owner_uuid+"\" target=\"_blank\">" + 
                      data.vm[i].owner + 
                      "</a></td><td><a href=\"https://10.245.122.2/ICSR/datasets/"+data.vm[i].dataset_uuid+"\" target=\"_blank\">" + 
                      data.vm[i].dataset + 
                      "</a></td></tr>";
    }
    server_usage += "</table>";

    $("#dialog_joyent_"+id).html(server_usage);
    $("#dialog_joyent_"+id).dialog( "option", "title", "<div class=\"dialog_title\">Joyent Usage for IP:["+serverIP+"], Name:["+serverJoyentName+"]</div>");
    $("#dialog_joyent_"+id).dialog( "option", "minWidth", 600 );
    $("#dialog_joyent_"+id).dialog( "open" );
  });
}

function execIPMICommand(ipmiOptions)
{
  $.getJSON('run-ipmi-command', { "ipmiOptions": ipmiOptions }, function(data) {
    $("#dialog_"+ipmiOptions.IP).html('<pre>'+data.output+'</pre>');
    $("#dialog_"+ipmiOptions.IP).dialog( "option", "title", "<div class=\"dialog_title\">IPMI Output for "+ipmiOptions.IP+"</div>");
    $("#dialog_"+ipmiOptions.IP).dialog( "open" );
  });
}

function nextRefreshCountdown(element, minutes, seconds) 
{
  // set time for the particular countdown
  var time = minutes*60 + seconds;
  var interval = setInterval(function() {
    var el = $("#"+element);
    // if the time is 0 then end the counter
    if(time == 0) {
      el.text("refreshing ...");
      clearInterval(interval);
      return;
    }
    var minutes = Math.floor( time / 60 );
    if (minutes < 10) minutes = "0" + minutes;
      var seconds = time % 60;
    if (seconds < 10) seconds = "0" + seconds; 
      var text = minutes + ':' + seconds;
    el.text(text + " minutes");
    time--;
  }, 1000);
}

function getServerStatus() 
{
  $.getJSON('get-server-status', function(data) {
    //Reset all servers to their original state.
    $("div.node").removeClass('warning');
    $("div.node").removeClass('error');
    $("div.node").addClass('good');
    // Reset the Power Status display
    $("img[src$='power_off.png']").css("display", "none");

    // Reset the Refresh count
    nextRefreshCountdown("refresh_time", 0, 0);  
 
    if (!data.success) {
      // Update visibility and text for Error encountered by the
      // Web Server in obtaining status of the servers.
      $("#error_status").text(data.error);
      $(".server_error").css("display", "block");
    } else {
      // Reset the Web Server Error container visbility
      $(".server_error").hide(); 
      // Update the last time a successful update occurred.
      $("#update_time").text(data.last_update);

      // Now Update the Error status/text for each server entry
      $.each(data.server_events, function(key, value) {
        var idName = "#" + key.replace(/\./g, "_");

        if (value.warning) {
          //Now Update the color to reflect that it is an error/warning
          $(idName).removeClass('good');

          $(idName).addClass('warning');
          // Clear any existing content in the error node.
          $(idName).find(".node_error").html('');
          $.each(value.warning, function(index, errorText) {
            // Update the error Text within the existing Error Element
            // Put the Error Text in a div block
            // so it is formatted properly
            $(idName).find(".node_error").append('<div>'+errorText+'</div>');
          });
        } else if (value.error) {
          //Now Update the color to reflect that it is an error/warning
          $(idName).removeClass('good');

          $(idName).addClass('error');
          // Clear any existing content in the error node.
          $(idName).find(".node_error").html('');
          $.each(value.error, function(index, errorText) {
            // Update the error Text within the existing Error Element
            // Put the Error Text in a div block
            // so it is formatted properly
            $(idName).find(".node_error").append('<div>'+errorText+'</div>');
          });
        }
        // Check each node and display the power status.
        if (value.power_status) {
          if (value.power_status.indexOf("Off") != -1) {
            $(idName).find("img[src$='power_off.png']").css("display", "inline");
          }
        }
      });
    }
  });
}

