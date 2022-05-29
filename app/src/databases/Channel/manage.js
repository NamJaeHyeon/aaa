"use strict";

const fs = require("fs");
const Storage = new (require("../Storage/manage"))();
const Validator = new (require("../../models/validator"))();
const crypto = require('crypto');

function sha256(value) {
  return crypto.createHmac('sha256', "소프트웨어 시장 씹어먹자 ㅋㅋ").update(value).digest('hex')
}

class Channel {

  canWrite(pathID,title,article,password){
    const info = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
    if (info.pathID.includes(pathID) && Validator.canStringInArr([title,article,password]))
      if (Validator.strLength(title,1,30) && Validator.strLength(article,1,1000))
        return true;
    return false;
  }

  canGet(pathID,index){
    const a = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
    if (Validator.canID(pathID) && Validator.strLength(pathID,1,10) && a.pathID.includes(pathID)) {
      const info = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/info.json`,"utf8"));
      return !info.blind[index];
    } else {
      return false;
    }
  }

  getChannelName(pathID){
    const info = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
    return info.channelName[info.pathID.indexOf(pathID)];
  }

  getArticle(pathID,index){
    if (this.canGet(pathID,index)){
      const info = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/${index}.json`,"utf8"));
      if (info.blinded){
        return;
      } else {
        info.article = Storage.getFile(info.article);
        info.attachments = info.attachments.map(x=>Storage.getFile(x));
        return info;
      }
    } else {
      return;
    }
  }

  writeArticle(pathID,title,writer,article,userID,password,attachments){
    if (this.canWrite(pathID,title,article,password)) {
      const a = attachments.map(x=>Storage.addFile(x));
      const info = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/info.json`,"utf8"));
      const jsonData = {
        "index": info.articleCount,
        "title": Validator.blockXSS(title),
        "writer": Validator.hideIP(writer),
        "article": Storage.addFile(Validator.blockXSS(article)),
        "userID": userID,
        "value": 0,
        "likeCount": 0,
        "like": [],
        "dislikeCount": 0,
        "dislike": [],
        "passwordHash": sha256(password),
        "date": "",
        "commentCount": 0,
        "commentLink": [],
        "attachments": a,
        "blinded": false,
        "view": [],
        "viewCount": 0
      };
      info.articleCount += 1;
      info.blind.push(false);
      fs.writeFileSync(`./src/databases/Channel/${pathID}/${info.articleCount-1}.json`,JSON.stringify(jsonData));
      fs.writeFileSync(`./src/databases/Channel/${pathID}/info.json`,JSON.stringify(info));
      return {msg: "success"};
    } else {
      return;
    }
  }

  getArticleList(pathID,startIndex,endIndex){
    const r = [];
    const info = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/info.json`,"utf8"));
    for (let i=startIndex;i<endIndex+1;i++){
      r.push(this.getArticle(pathID,i));
    }
    return r;
  }
  
  makeArticleHtmlList(pathID,page){
    let t = "";
    let a = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/info.json`,"utf8"));
    let startIndex = 0, endIndex = 0;
    if (page*50 < a.articleCount) {
      startIndex = a.articleCount-1-page*50;
      endIndex = (a.articleCount-50-page*50>0?a.articleCount-50-page*50:0);
    } else {
      startIndex = a.articleCount-1;
      endIndex = (a.articleCount-50>0?a.articleCount-50:0);
    }
    for(let i = startIndex; i >= endIndex; i--){
      if (this.canGet(pathID,i)) {
        let b = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/${i}.json`,"utf8"));
        t += `<div>${i}</div><div><a href="/channel/${pathID}/${i}"><div style="width:100%;height:100%;text-align:left">${b.title}</div></a></div><div>${b.writer}</div><div>${b.value}</div>
        `;
      }
    }
    return {chli:t, channelName:a.ChannelName};
  }

}

module.exports = Channel;