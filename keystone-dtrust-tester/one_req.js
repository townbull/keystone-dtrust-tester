#!/usr/bin/env /usr/bin/node

var exec = require('child_process').exec;
var output = {};


var execCurl = function(){
   exec(__dirname+"/curl.sh u2.d2 p1.d1", function (error1, stdout1, stderr1){
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

var sendReq = function(){
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

process.on('exit',function(){
  console.log(JSON.stringify(output));
});

