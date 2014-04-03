var express = require('express');
//var https = require('https');
var app = express();
var http = require('http');

var exec  = require('child_process').exec;
var fs =  require('fs');
var myJSONObject = {};
var myIPMICommandResponse = [];
var userAuthPasswd = "";
/*var httpsOptions = {
  key: fs.readFileSync('/root/web_server/RDC_SERVER_CHECK/privatekey.pem'),
  cert: fs.readFileSync('/root/web_server/RDC_SERVER_CHECK/certificate.pem')
};*/

var spawnReq = function() {

  fs.readFile('/root/web_server/.webApp.passwd', 'utf8', function(err, data) {
    if (err) throw err;
    myString = data.toString('ascii', 0, data.length-3);
    var stored_passwd = "";
    for( var i = 0; i < myString.length; i++) {
      if (myString[i] != '\n') {
        stored_passwd += myString[i];
      }
    }
    userAuthPasswd = stored_passwd;
  });
}

var serverCheck = function() {
  exec(__dirname+"/keystone-dtrust-tester/batch_req.js", function (error, stdout, stderr) {
    var update_date = new Date();
    myJSONObject.last_update = "" + update_date.getFullYear() + "-" + 
                               (update_date.getMonth()+1) + "-" + 
                               update_date.getDate() + "    " + 
                               update_date.getHours() + ":" + 
			                         update_date.getMinutes() + ":" + 
                               update_date.getSeconds() ;
    if (error != null) {
      myJSONObject.success = false;
      myJSONObject.error = ""+error.toString()+"";
      console.log('An Exec Error occured: ' + error);
    } else if (stderr.length != 0) {
      myJSONObject.success = false;
      myJSONObject.error = ""+stderr.toString()+"";
      console.log('An Exec Error occured on STDERR: ' + stderr);
    } else if (stdout.length != 0 || stdout != null) {
      myJSONObject.success = true;
      try {
        myJSONObject.output = JSON.parse(stdout); 
      } catch (err) {
        myJSONObject.success = false;
        myJSONObject.error = ""+err.stack+"\nThe output of server_check.js script is:\n"+stdout;
      }
    } else {
      myJSONObject.success = false;
      myJSONObject.error = "Unknown Error Occurred: The output of server_check.js script is empty!";
    }
  });
}

// var runIPMICommand = function(ipmiOptions) {
//   var serverIP = ipmiOptions.IP.replace(/_/g, '.');
//   var ipmiParms = '';
//   for (i in ipmiOptions.ipmi_parms) {
//     ipmiParms += ' ' + ipmiOptions.ipmi_parms[i] ;
//   }
//   exec('/usr/sbin/ipmitool -U root -I lanplus -f /root/web_server/RDC_SERVER_CHECK/.ipmi -H ' + serverIP + ipmiParms,
//     function (error, stdout, stderr) {
//       var myJSONOutput = {};
//       myJSONOutput.IP = ipmiOptions.IP;
//       if (error != null) {
//         myJSONOutput.success = false;
//         myJSONOutput.output = error.toString();
//       } else if (stderr.length != 0) {
//         myJSONOutput.success = false;
//         myJSONOutput.output = stderr;
//       } else {
//         myJSONOutput.success = true;
//         myJSONOutput.output = stdout;
//       }
//       myIPMICommandResponse[ipmiOptions.IP] = myJSONOutput;
//     }
//   );
// }

http.createServer(app).listen(8081);

// Setup User Authentication
/*getPasswd();
app.use(express.basicAuth(function(user, pass, callback) {
  var result;
  if (user === 'root' && pass === userAuthPasswd) {result = true;}
  callback(null, result);
}));
*/

// Setup base directory for html and all other web server files.
// app.use(express.static('/root/web_server/RDC_SERVER_CHECK'));
app.use(express.static(__dirname + '/static'));


// Now create the https server
//https.createServer(httpsOptions, app).listen(443);

// Redirect all http traffic to https
/*http_app.get('*', function(req, res) {
  res.redirect('https://10.245.0.17/');
});*/

// Gather all server data once, then every 5 minutes.
serverCheck();

/*var runServerCheck = setInterval(function() {
  serverCheck();
}, 300000);
*/

app.get('/get-keystone', function (req, res) {
  if (myJSONObject.success != null) {
   res.json(myJSONObject);
  } else {
    setInterval(function() {
      if (myJSONObject.success != null) {
        res.json(myJSONObject);
        clearInterval();
        return;
      }
    }, 10000);
  }
});

/*
app.get('/run-ipmi-command', function (req, res) {
  myIPMICommandResponse[req.query.ipmiOptions.IP] = null;
  runIPMICommand(req.query.ipmiOptions);
  if (myIPMICommandResponse[req.query.ipmiOptions.IP] != null) {
   res.json(myIPMICommandResponse[req.query.ipmiOptions.IP]);
  } else {
    setInterval(function() {
      if (myIPMICommandResponse[req.query.ipmiOptions.IP] != null) {
        res.json(myIPMICommandResponse[req.query.ipmiOptions.IP]);
        clearInterval();
        return;
      }
    }, 5000);
  }
});*/

