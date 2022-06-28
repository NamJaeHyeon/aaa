"use strict";

const fs = require("fs");
const Storage = new (require("../Storage/manage"))();
const Validator = new (require("../../models/validator"))();
const User = new (require("../User/manage"))();
const crypto = require('crypto');

function sha256(value) {
  return crypto.createHmac('sha256', "소프트웨어 시장 씹어먹자 ㅋㅋ").update(value).digest('hex')
}

class Channel {

  getChannelsInfo(){
    return JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
  }

  existsPathID(pathID,channelsInfo){
    return channelsInfo.pathID.includes(pathID);
  }

  getChannelInfo(pathID){
    return JSON.parse(fs.readFileSync("./src/databases/Channel/"+pathID+"/info.json","utf8"));
  }

  existsArticle(index,channelInfo){
    return Validator.canIndexNumber(index)&&index<channelInfo.articleCount;
  }

  getArticleInfo(pathID,index){
    return JSON.parse(fs.readFileSync("./src/databases/Channel/"+pathID+"/"+index+".json","utf8"));
  }

  parseArticleByInfo(obj){
    const a = obj.article;
    obj.article = Storage.getFile(obj.article);
    return [obj,a];
  }

  getParsedArticle(pathID,index,doGetUser){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo),channelsInfo){
      const channelInfo = this.getChannelInfo(pathID);
      if(this.existsArticle(index,channelInfo)){
        const r = this.parseArticleByInfo(this.getArticleInfo(pathID,index));
        if(!doGetUser) return r;
        else return {article: r, user:User.getUserInfo(r[0].writer)};
      } else {
        return "doesn't exist the article";
      }
    } else {
      return "doesn't exist the pathID";
    }
  }

  saveArticle_(pathID,index,obj){
    fs.writeFileSync(`./src/databases/Channel/${pathID}/${index}.json`,JSON.stringify(obj));
    return;
  }

  setArticle(pathID,index,title,article,ip,edited,blinded){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo)){
      const channelInfo = this.getChannelInfo(pathID);
      if(this.existsArticle(index,channelInfo)){
        const articleInfo = this.getArticleInfo(pathID,index);
        if(title !== undefined) articleInfo.title = title;
        if(article !== undefined) Storage.setFile(articleInfo.article,article);
        if(ip !== undefined) articleInfo.writer = ip;
        if(edited !== undefined) articleInfo.edited = edited;
        if(blinded !== undefined) articleInfo.blinded = blinded;
        this.saveArticle_(pathID,index,articleInfo);
        return "success";
      } else {
        return "doesn't exist the article";
      }
    } else {
      return "doesn't exist the pathID";
    }
  }

  writeArticle(pathID,title,article,ip,pwHash){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo)){
      const channelInfo = this.getChannelInfo(pathID);
      const articleInfo = {
        "index": channelInfo.articleCount,
        "title": title,
        "writer": ip,
        "article": Storage.addFile(article),
        "value": 0,
        "likeCount": 0,
        "like": [],
        "dislikeCount": 0,
        "dislike": [],
        "passwordHash": sha256(pwHash),
        "date": (new Date()).getTime(),
        "commentCount": 0,
        "commentLink": [],
        "attachments": [],
        "blinded": false,
        "view": [],
        "viewCount": 0,
        "edited": false
      }
      this.saveArticle_(pathID,channelInfo.articleCount,articleInfo);
      channelInfo.articleCount += 1;
      fs.writeFileSync("./src/databases/Channel/"+pathID+"/info.json",JSON.stringify(channelInfo));
      return "success";
    } else {
      return "doesn't exist the pathID";
    }
  }

  editArticle(pathID,index,title,article,pwHash){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo)){
      const channelInfo = this.getChannelInfo(pathID);
      if(this.existsArticle(index,channelInfo)){
        const articleInfo = this.getArticleInfo(pathID,index);
        if(articleInfo.blinded) return "the article is blinded";
        if(!Validator.strLength(title,1,30)) return "unable title length";
        if(!Validator.strLength(article,1,1000)) return "unable article length";
        if(articleInfo.passwordHash !== sha256(pwHash)) return "mismatched password";
        articleInfo.edited = true;
        articleInfo.title = title;
        Storage.setFile(articleInfo.article,article);
        this.saveArticle_(pathID,index,articleInfo);
        return "success";
      } else {
        return "doesn't exist the article";
      }
    } else {
      return "doesn't exist the pathID";
    }
  }

  viewArticle(pathID,index,ip,doBlockXSS){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo)){
      const channelInfo = this.getChannelInfo(pathID);
      if(this.existsArticle(index,channelInfo)){
        const [articleInfo,a] = this.getParsedArticle(pathID,index);
        const b = articleInfo.article;
        if(!articleInfo.view.includes(ip)) {
          articleInfo.view.push(ip);
          articleInfo.viewCount = articleInfo.view.length;
          articleInfo.article = a;
          this.saveArticle_(pathID,index,articleInfo);
        }
        if (doBlockXSS !== false){
          articleInfo.article = Validator.blockXSS(b);
          articleInfo.title = Validator.blockXSS(articleInfo.title);
        }
        articleInfo.writer = Validator.hideIP(articleInfo.writer);
        return Object.assign(articleInfo,{channelName:channelInfo.ChannelName,blockedCount:User.getBlockedCount(articleInfo.writer)});
      } else {
        return "doesn't exist the article";
      }
    } else {
      return "doesn't exist the pathID";
    }
  }

  deleteArticle(pathID,index,pwHash){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo)){
      const channelInfo = this.getChannelInfo(pathID);
      if(this.existsArticle(index,channelInfo)){
        const articleInfo = this.getArticleInfo(pathID,index);
        if(articleInfo.passwordHash !== sha256(pwHash)) return "mismatched password";
        this.setArticle(pathID,index,undefined,undefined,undefined,undefined,true);
        return "success";
      } else {
        return "doesn't exist the article";
      }
    } else {
      return "doesn't exist the pathID";
    }
  }

  valueArticle(pathID,index,ip,type){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo)){
      const channelInfo = this.getChannelInfo(pathID);
      if(this.existsArticle(index,channelInfo)){
        const articleInfo = this.getArticleInfo(pathID,index);
        if(type==="like"){
          if(articleInfo.like.includes(ip)){
            return "already like";
          } else {
            if(articleInfo.dislike.includes(ip)){
              articleInfo.dislike = articleInfo.dislike.filter(x => x!==ip);
              articleInfo.dislikeCount = articleInfo.dislike.length;
            }
            articleInfo.like.push(ip);
            articleInfo.likeCount = articleInfo.like.length;
            this.saveArticle_(pathID,index,articleInfo);
            return "success";
          }
        } else if (type==="dislike") {
          if(articleInfo.dislike.includes(ip)){
            return "already dislike";
          } else {
            if(articleInfo.like.includes(ip)){
              articleInfo.like = articleInfo.like.filter(x => x!==ip);
              articleInfo.likeCount = articleInfo.like.length;
            }
            articleInfo.dislike.push(ip);
            articleInfo.dislikeCount = articleInfo.dislike.length;
            this.saveArticle_(pathID,index,articleInfo);
            return "success";
          }
        } else {
          return "what type?";
        }
      } else {
        return "doesn't exist the article";
      }
    } else {
      return "doesn't exist the pathID";
    }
  }

  getHTMLArticlesList(pathID,page,requestIp){
    const channelsInfo = this.getChannelsInfo();
    if(this.existsPathID(pathID,channelsInfo)){
      const channelInfo = this.getChannelInfo(pathID);
      let t = "";
      const c = channelInfo.articleCount;
      const myInfo = User.getUserInfo(requestIp);
      const ipToBlock = myInfo.user.ipToBlock;
      let startIndex,endIndex;
      if (Validator.canIndexNumber(page) && page>0 && page<=c/50+1) {
        startIndex = c-50*page<0?0:c-50*page;
        endIndex = c-50*(page-1);
      } else {
        startIndex = c-50<0?0:c-50;
        endIndex = c;
      }
      for(let i=startIndex;i<endIndex;i++){
        if(this.existsArticle(i,channelInfo)){
          let articleInfo = this.getArticleInfo(pathID,i);
          if(!ipToBlock.includes(articleInfo.writer))t = `<div>${articleInfo.index}</div><div>${articleInfo.blinded?"":`<a href="/channel/${pathID}/${i}">`}<div style="width:100%;height:100%;text-align:left;">${ipToBlock.includes(articleInfo.writer) ? "<span style='color:red'>(차단한 IP)</span>" : ""} ${Validator.blockXSS(articleInfo.title)} ${articleInfo.blinded?`<span style="color:gray">(삭제됨)</span>`:articleInfo.edited?`<span style="color:gray">(수정됨)</span>`:""}</div>${articleInfo.blinded?"":"</a>"}</div><div>${Validator.hideIP(articleInfo.writer)}</div><div>${articleInfo.viewCount}</div><div>${articleInfo.likeCount-articleInfo.dislikeCount}</div><div>${(x=>x.getMonth()+1+"/"+x.getDate())(new Date(articleInfo.date))}</div>
        ` + t;
        }
      }
      return {chli:t,channelName:channelsInfo.channelName[channelsInfo.pathID.indexOf(pathID)]};
    } else {
      return "doesn't exist the pathID";
    }
  }

}

module.exports = Channel;