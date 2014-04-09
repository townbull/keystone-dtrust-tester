#!/usr/bin/env /usr/bin/node

var exec  = require('child_process').exec;
var fs =  require('fs');
var serverList = [];
var IPMI_RETRY_LIMIT = 1;
var retry_count = [];
var output = [];

var spawnReq = function(){

  for( var i = 0; i < 20; i++) {
    // console.log("Execution No. ", i);
    // console.log(__dirname);
    execCurl(i);
   
  }

}

var execCurl = function(i){
   exec(__dirname+"/curl.sh u2.p2 u1.p1", function (error1, stdout1, stderr1){
      //console.log("Execution No. "+i);
      if(error1 != null){

      } else if(stderr1.length != 0){

      } else if(stdout1.length != 0 || stdout1 != null) {
        output[i] = JSON.parse(stdout1); 
      } else {

      }
    }
    );
}

// var readServerList = function() {
//   var myString = '';
//   fs.readFile('/root/web_server/RDC_SERVER_CHECK/ics_servers', 'utf8', function(err, data) {
//     if (err) throw err;
//     myString = data.toString('ascii', 0, data.length);

//     var serverIP = '';
//     for( var i = 0; i < myString.length; i++) {
//       if (myString[i] == '\n') {
//         var server = new Object();
//         server.server_status = '';
//         server.power_status = '';
//         serverList[serverIP] = server;
//         retry_count[serverIP] = 0;
//         doExec(serverIP);
//         serverIP = '';
//       } else {
//         serverIP += myString[i];
//       }
//     }
//   });
// }

// var doExec = function(serverIP) {
//   exec('/usr/sbin/ipmitool -U root -I lanplus -f /root/web_server/RDC_SERVER_CHECK/.ipmi -H ' + serverIP + ' sel elist last 5|cut -d"|" -f2-', function (error1, stdout1, stderr1) {  
//     if (error1 != null) {
//       serverList[serverIP].server_status = error1;
//       if (retry_count[serverIP] == IPMI_RETRY_LIMIT) {
//         retry_count[serverIP] = 0;
//         return;
//       }
//     } else if (stderr1.length != 0) {
//       serverList[serverIP].server_status = stderr1;
//       if (retry_count[serverIP] == IPMI_RETRY_LIMIT) {
//         retry_count[serverIP] = 0;
//         return;
//       }
//     } else { 
//       serverList[serverIP].server_status = stdout1;
//       //Only if the IPMI command works do we want to execute IPMI Power Status check.
//       checkPowerStatus(serverIP);
//       retry_count[serverIP] = 0;
//       return;
//     } 
//     setTimeout(function() {
//       retry_count[serverIP]++;
//       doExec(serverIP);
//     }, 20000);
//   });
// }

// var checkPowerStatus = function(serverIP) {
//   exec('/usr/sbin/ipmitool -U root -I lanplus -f /root/web_server/RDC_SERVER_CHECK/.ipmi -H ' + serverIP + ' power status', function (error, stdout, stderr) {
//     if (stdout != null) {
//       serverList[serverIP].power_status = stdout;
//     } else {
//       serverList[serverIP].power_status = "Chassis Power is undefined";
//     }
//   });
// }

// readServerList();
spawnReq();

process.on('exit',function(){
  var myJSONObject = {};
  // for (var i in serverList) {
  //   if (serverList[i].server_status.indexOf("UnCorrectable ECC") >= 0 ||
  //       serverList[i].server_status.indexOf("Fault") >= 0 ||
  //       serverList[i].server_status.indexOf("fail") >= 0 ||
  //       serverList[i].server_status.indexOf("Fail") >= 0 ||
  //       serverList[i].server_status.indexOf("Error") >= 0 ||
  //       serverList[i].server_status.indexOf("error") >= 0) {

  //     myJSONObject[i] = {};

  //     // Store in the appropriate category [error/warning]
  //     if (serverList[i].server_status.indexOf("Unable to establish IPMI v2") >= 0 ||
  //         serverList[i].server_status.indexOf("Get SDR") >= 0) {
  //       myJSONObject[i].warning = [];
  //       var index = 0;
  //       var errorString = "";
  //       myJSONObject[i].warning[index] = "";
  //       // Store the Error description in a JSON array
  //       for( var j = 0; j < serverList[i].server_status.length; j++) {
  //         if (serverList[i].server_status[j] == '\n') { 
  //           myJSONObject[i].warning[index++] = errorString;
  //           errorString = "";
  //         } else {
  //           errorString += serverList[i].server_status[j];
  //         }
  //       }
  //     } else {
  //       myJSONObject[i].error = [];
  //       var index = 0;
  //       var errorString = "";
  //       myJSONObject[i].error[index] = "";
  //       // Store the Error description in a JSON array
  //       for( var j = 0; j < serverList[i].server_status.length; j++) {
  //         if (serverList[i].server_status[j] == '\n') { 
  //           myJSONObject[i].error[index++] = errorString;
  //           errorString = "";
  //         } else {
  //           errorString += serverList[i].server_status[j];
  //         }
  //       }
  //     }
  //   }
  //   if (serverList[i].power_status.indexOf("Chassis Power is off") != -1) {
  //     if (myJSONObject[i] != null) {
  //       myJSONObject[i].power_status = "Off";
  //     } else {
  //       myJSONObject[i] = {};
  //       myJSONObject[i].power_status = "Off";
  //     }
  //   }
  // }
  for (var i in output) {
    myJSONObject[i]
  }
  console.log(JSON.stringify(output));
});

