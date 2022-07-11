"use strict";

const fs = require('fs');
const Validator = new (require("../../models/validator"))();
const Storage = new (require("../Storage/manage"))();
const crypto = require('crypto');

function sha256(value) {
  return crypto.createHmac('sha256', "소프트웨어 시장 씹어먹자 ㅋㅋ").update(value).digest('hex')
}

class Comment {
  
  getInfo() {
    return JSON.parse(fs.readFileSync("./src/databases/Comment/info.json","utf8"));
  }

  getComment__force(index){
    return JSON.parse(fs.readFileSync("./src/databases/Comment/"+index+".json","utf8"));
  }

  isValidatedIndex(index,info){
    return Validator.canIndexNumber(Number(index)) && 0 <= index && index < info.count;
  }
  
  getComment(index,info){
    if(!info) info = this.getInfo();
    if(this.isValidatedIndex(index,info))
      return this.getComment__force(index);
    else
      return undefined;
  }

  makeComment__force(root, content, writer, pwHash, info){
    fs.writeFileSync("./src/databases/Comment/"+info.count+".json",JSON.stringify({
      "index": info.count,
      "content": Storage.addFile(content),
      "innerComment": [],
      "root": root,
      "like": [],
      "likeCount": 0,
      "dislike": [],
      "dislikeCount": 0,
      "writer": writer,
      "userType": 0,
      "date": +new Date(),
      "pwHash": sha256(pwHash),
      "attachments": []
    }));
    const rootComment = JSON.parse(fs.readFileSync("./src/databases/Comment/"+root+".json","utf8"));
    rootComment.innerComment.push(info.count);
    fs.writeFileSync(`./src/databases/Comment/${root}.json`,JSON.stringify(rootComment));
    info.count++;
    fs.writeFileSync("./src/databases/Comment/info.json",JSON.stringify(info));
    return "success";
  }

  makeComment(root, content, writer, pwHash){
    const info = this.getInfo();
    if (this.isValidatedIndex(root,info) && Validator.strLength(content,1,300))
      return this.makeComment__force(root, content, writer, pwHash, info);
    else return;
  }

  parseComment(comment){
    comment.content = Storage.getFile(comment.content);
    delete comment.pwHash;
    delete comment.attachments;
    delete comment.like;
    delete comment.dislike;
    comment.writer = comment.writer.split(".").slice(0,2).join(".");
    return comment;
  }

  like(index, ip) {
    const info = this.getInfo();
    if(this.isValidatedIndex(index,info)){
      const comment = this.getComment(index,info);
      if(comment.like.includes(ip)){
        return "already";
      } else if(comment.dislike.includes(ip)){
        comment.dislike = comment.dislike.filter(x => x!==ip);
      }
      comment.like.push(ip);
      comment.likeCount = comment.like.length;
      comment.dislikeCount = comment.dislike.length;
      fs.writeFileSync("./src/databases/Comment/"+index+".json",JSON.stringify(comment));
      return "success";
    } else {
      return "error";
    }
  }
  
  dislike(index, ip) {
    const info = this.getInfo();
    if(this.isValidatedIndex(index,info)){
      const comment = this.getComment(index,info);
      if(comment.dislike.includes(ip)){
        return "already";
      } else if(comment.like.includes(ip)){
        comment.like = comment.like.filter(x => x!==ip);
      }
      comment.dislike.push(ip);
      comment.likeCount = comment.like.length;
      comment.dislikeCount = comment.dislike.length;
      fs.writeFileSync("./src/databases/Comment/"+index+".json",JSON.stringify(comment));
      return "success";
    } else {
      return "error";
    }
  }
  
}

module.exports = Comment;