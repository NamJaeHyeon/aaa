"use strict";

const fs = require("fs");
const StorageManage = require("./src/databases/Storage/manage");
const Storage = new StorageManage();

class User {

  getInfo(){
    return JSON.parse(fs.readFileSync("./src/databases/User/info.json","utf8"));
  }

  isRegisteredUserID(userID){
    const info = this.getInfo();
    return info.userID.includes(userID);
  }

  register(userID,nickname,password){
    if(userID){

    } else {
      return false;
    }
  }

  getUserInfo(userID){
    const info = this.getInfo();
    return ;
  }

}

module.exports = Storage;