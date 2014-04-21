var express = require('express');
var app = express();
var http = require('http');
var exec  = require('child_process').exec;


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

http.createServer(app).listen(8081);

// Setup base directory for html and all other web server files.
// app.use(express.static('/root/web_server/RDC_SERVER_CHECK'));
app.use(express.static(__dirname + '/static'));

// Streaming response until all the concurrent requests are responded.
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
