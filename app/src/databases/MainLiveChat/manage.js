"use strict";

const fs = require('fs');
const Validator = new (require("../../models/validator"))();
const Storage = new (require("../Storage/manage"))();

class LiveChat {

  addChat(req, res){
    if(Validator.strLength(req.body.liveChat,1,100)){
      const a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
      a.writer.push(req.headers["x-forwarded-for"] || req.ip);
      a.content.push(Storage.addFile(req.body.liveChat));
      a.count += 1;
      fs.writeFileSync("./src/databases/MainLiveChat/info.json",JSON.stringify(a));
      return {msg:"success"};
    } else {
      return {msg:"잘못된 요청입니다."};
    }
  }

  printLiveChat(){
    let t = "";
    let a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
    let b = a.count;
    for(let i=b-1; i >= (b-15>=0 ? b-15:0);i--) t+=`
              <div>
                <span style="font-size:15px;float:left;width:100px">${Validator.hideIP(a.writer[i])}</span>
                <span style="font-size:15px;float:right;width:400px;overflow:hidden;text-overflow:ellipsis;">${Validator.blockXSS(Storage.getFile(a.content[i]))}</span>
              </div>`;
    return [t,b];
  }

  liveChatInfo(req, res){
    const a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
    return {msg:"success",count:a.count};
  }

  getLiveChat(req, res){
    const a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
    const b = Storage.getFile(a.content[req.body.index]);
    return {msg:"success",writer:a.writer[req.body.index],t:b};//writer,content
  }

}

module.exports = LiveChat;