"use strict";

const fs = require("fs");

class Storage {

  getFile(index){
    return fs.readFileSync("./src/databases/Storage/"+index,"utf8");
  }

  setFile(index, file){
    fs.writeFileSync("./src/databases/Storage/"+index,typeof(file)==="string" ? file:JSON.stringify(file));
    return;
  }

  addFile(file){
    const info = JSON.parse(fs.readFileSync("./src/databases/Storage/info.json","utf8"));
    fs.writeFileSync("./src/databases/Storage/"+info.count,typeof(file)==="string" ? file:JSON.stringify(file));
    info.count += 1;
    fs.writeFileSync("./src/databases/Storage/info.json",JSON.stringify(info));
    return info.count-1;
  }
  
}

module.exports = Storage;