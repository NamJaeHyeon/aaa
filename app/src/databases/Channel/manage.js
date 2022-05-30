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

  getArticle(pathID,index,doParse,view,ip){
    if (this.canGet(pathID,index)){
      const info = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/${index}.json`,"utf8"));
      if (info.blinded){
        return "blinded";
      } else {
        if(view===true){
          if(!info.view.includes(ip)){
            info.view.push(ip);
            info.viewCount+=1;
            fs.writeFileSync(`./src/databases/Channel/${pathID}/${index}.json`,JSON.stringify(info));
          }
        }
        if(doParse!==false){
          info.article = Storage.getFile(info.article);
          info.attachments = info.attachments.map(x=>Storage.getFile(x));
        }
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
        "date": (new Date()).getTime(),
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
        t += `<div>${i}</div><div><a href="/channel/${pathID}/${i}"><div style="width:100%;height:100%;text-align:left">${b.title}</div></a></div><div>${b.writer}</div><div>${b.viewCount}</div><div>${b.likeCount-b.dislikeCount}</div>
        `;
      }
    }
    return {chli:t, channelName:a.ChannelName};
  }

  setArticle(pathID,index,title,article,blinded){
    const a = this.getArticle(pathID,index,false);
    if(title!==false)a.title = title;
    if(article!==false)a.article = Storage.addFile(article);
    a.blinded = blinded;
    fs.writeFileSync(`./src/databases/Channel/${pathID}/${index}.json`,JSON.stringify(a));
    return true;
  }

  deleteArticle(pathID,index,hash){
    if (this.canGet(pathID,index)) {
      const a = this.getArticle(pathID,index,false);
      if (sha256(hash) === a.passwordHash) {
        this.setArticle(pathID,index,false,false,true);
        return "success";
      } else {
        return "wrongPW";
      }
    } else {
      return "error";
    }
  }

  articleUpdate(pathID,index,reqType,ip){
    if(reqType==="like"){
      const a = this.getArticle(pathID,index,false);
      const b = a.like.includes(ip);
      const c = a.dislike.includes(ip);
      if (c){
        a.dislike = a.dislike.filter(function(item) {
          return item !== ip;
        });
      }
      if (b){
        return "already like"
      } else {
        a.like.push(ip);
      }
      if(a.dislike.includes(ip)){
        a.dislike = a.filter(x => x === ip);
      }
      a.likeCount = a.like.length;
      a.dislikeCount = a.dislike.length;
      fs.writeFileSync(`./src/databases/Channel/${pathID}/${index}.json`,JSON.stringify(a));
      return "like success";
    } else if(reqType==="dislike"){
      const a = this.getArticle(pathID,index,false);
      const b = a.like.includes(ip);
      const c = a.dislike.includes(ip);
      if (b){
        a.like = a.like.filter(function(item) {
          return item !== ip;
        });
      }
      if (c){
        return "already dislike"
      } else {
        a.dislike.push(ip);
      }
      if(a.like.includes(ip)){
        a.like = a.like.filter(x => x === ip);
      }
      a.likeCount = a.like.length;
      a.dislikeCount = a.dislike.length;
      fs.writeFileSync(`./src/databases/Channel/${pathID}/${index}.json`,JSON.stringify(a));
      return "dislike success";
    } else {
      return false;
    }
  }

}

module.exports = Channel;