"use strict";

const fs = require("fs");
const Validator = new (require("../../models/validator"))();

class User {

  getInfo(){
    return JSON.parse(fs.readFileSync("./src/databases/User/info.json","utf8"));
  }

  getUser(ip,info){
    const index = info.id.indexOf(ip);
    if(Validator.canIndexNumber(index) && index < info.id.length) return JSON.parse(fs.readFileSync("./src/databases/User/"+info.id.indexOf(ip)+".json","utf8"));
    else return "can not find user";
  }

  saveInfo(obj){
    fs.writeFileSync("./src/databases/User/info.json",JSON.stringify(obj));
  }

  saveUser(obj){
    fs.writeFileSync("./src/databases/User/"+obj.index+".json",JSON.stringify(obj));
  }

  register(ip){
    const info = this.getInfo();
    if(info.id.includes(ip)) return;
    this.saveUser({
      "type": 0,
      "index": info.count,
      "ip": ip,
      "activities": [],
      "ipToBlock": [],
      "blockedTo": []
    });
    info.count += 1;
    info.id.push(ip);
    info.type.push(0);
    this.saveInfo(info);
  }

  blockUser(fromIp,toIp){
    if (fromIp === toIp) return {msg: "can't block yourself"};
    this.register(fromIp);
    this.register(toIp);
    const info = this.getInfo();
    const fromInfo = this.getUser(fromIp,info);
    const toInfo = this.getUser(toIp,info);
    if(!toInfo.ipToBlock.includes(fromIp)){
      toInfo.ipToBlock.push(fromIp);
      this.saveUser(toInfo);
    }
    if(!fromInfo.blockedTo.includes(toIp)){
      fromInfo.blockedTo.push(toIp);
      this.saveUser(fromInfo);
    }
    return {msg: "success"};
  }

  getBlockedCount(ip){
    const info = this.getInfo();
    if(info.id.includes(ip)){
      const userInfo = this.getUser(ip,info);
      return {msg:"success",detail:userInfo.blockedTo.length};
    } else {
      this.register(ip);
      let userInfo = this.getUser(ip,info);
      return {msg:"success",detail:userInfo.blockedTo.length};
    }
  }

  getBlockedList(ip){
    let info = this.getInfo();
    if(info.id.includes(ip)){
      let userInfo = this.getUser(ip,info);
      return {msg:"success",detail:userInfo.blockedTo};
    } else {
      this.register(ip);
      let userInfo = this.getUser(ip,info);
      return {msg:"success",detail:userInfo.blockedTo};
    }
  }

  getUserInfo(ip){
    let info = this.getInfo();
    if(info.id.includes(ip)){
      return {main: info, user: this.getUser(ip,info)};
    } else {
      this.register(ip);
      return {main: this.getInfo(), user: this.getUser(ip,info)};
    }
  }

}

module.exports = User;