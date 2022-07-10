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
                <div style="display:inline-block;font-size:15px;width:110px">${Validator.hideIP(a.writer[i])}</div>
                <div style="display:inline-block;font-size:15px;width:1070px;overflow:hidden;text-overflow:ellipsis;">${Validator.blockXSS(Storage.getFile(a.content[i]))}</div>
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
    return {msg:"success",writer:Validator.hideIP(a.writer[req.body.index]),t:b};//writer,content
  }

}

module.exports = LiveChat;