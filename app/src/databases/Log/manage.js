"use strict";

const fs = require('fs');

class Log {

  mkLog(req, res){
    fs.writeFileSync('./src/databases/Log/tmp/log.txt',`${fs.readFileSync('./src/databases/Log/tmp/log.txt',"utf8")}
${(new Date()).getTime()+Math.floor(Math.random()*1000)} | ${req.headers["x-forwarded-for"]||req.ip} | ${JSON.stringify(req.params)} | ${JSON.stringify(req.route.methods)} | ${JSON.stringify(req.body)}`);
  };

}

module.exports = Log;