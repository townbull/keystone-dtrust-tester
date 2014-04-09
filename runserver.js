var express = require('express');
var app = express();
var http = require('http');

var exec  = require('child_process').exec;
var fs =  require('fs');
//var myJSONObject = {};
var userAuthPasswd = "";
/*var httpsOptions = {
  key: fs.readFileSync('/root/web_server/RDC_SERVER_CHECK/privatekey.pem'),
  cert: fs.readFileSync('/root/web_server/RDC_SERVER_CHECK/certificate.pem')
};*/

var spawnReq = function(resp, num) {
  for( var i = 0; i < num; i++) {
    // console.log("Execution No. ", i);
    // console.log(__dirname);i
    serverCheck(resp, i);

  }
}

var serverCheck = function(respArray, index) {
  exec(__dirname+"/keystone-dtrust-tester/one_req.js", function (error, stdout, stderr) {
    var update_date = new Date();
    var myJSONObject = {};
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
      try {
        myJSONObject.output = JSON.parse(stdout); 
      } catch (err) {
        myJSONObject.success = false;
        myJSONObject.error = ""+err.stack+"\nThe output of server_check.js script is:\n"+stdout;
      }
      myJSONObject.success = true;
    } else {
      myJSONObject.success = false;
      myJSONObject.error = "Unknown Error Occurred: The output of server_check.js script is empty!";
    }
    respArray[index] = JSON.stringify(myJSONObject)
    console.log('respArray[' + index + '] = ' + respArray[index]);
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


/*var runServerCheck = setInterval(function() {
  serverCheck();
}, 300000);
*/

app.get('/runtests', function (req, res) {
  var ksResponse = [];
  var reqnum = 20;
  spawnReq(ksResponse, reqnum);
  //res.json({"complete": ksResponse.length});
  //console.log("complete response" + ksResponse);
    //res.writeHead(200, { 'Content-Type': 'text/plain' });
    var progress = setInterval(function() {
      res.write('{"completed": ' + ksResponse.length + '}');
      if (ksResponse.length == reqnum) {
        res.write(JSON.stringify({"Keystone Responses":ksResponse}));
        res.end();
        clearInterval(progress);
      }
    }, 100);
    
});

app.get('/checkresults', function (req, res) {
  var ksResponse = [];
  var reqnum = 20;
  spawnReq(ksResponse, reqnum);
  res.json({"complete": ksResponse.length});
  
  console.log("complete response"+ksResponse);
  if (ksResponse.length == reqnum) {
    console.log("complete response");
    res.json({"Keystone Responses":ksResponse});
  } else {
    setInterval(function() {
      res.json({"complete": ksResponse.length});
      if (ksResponse.length == reqnum) {
        res.json({"Keystone Responses":ksResponse});
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

