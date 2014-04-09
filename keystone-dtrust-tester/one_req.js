#!/usr/bin/env /usr/bin/node

var exec  = require('child_process').exec;
var fs =  require('fs');
var serverList = [];
var IPMI_RETRY_LIMIT = 1;
var retry_count = [];
var output = {};

var execCurl = function(){
   exec(__dirname+"/curl.sh u2.p2 u1.p1", function (error1, stdout1, stderr1){
      if(error1 != null){

      } else if(stderr1.length != 0){

      } else if(stdout1.length != 0 || stdout1 != null) {
        output = JSON.parse(stdout1); 
      } else {

      }
    }
    );
}


execCurl();

process.on('exit',function(){
  console.log(JSON.stringify(output));
});

