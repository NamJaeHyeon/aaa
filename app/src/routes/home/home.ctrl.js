"use strict";

const res = require("express/lib/response");
const fs = require("fs");
const { userInfo } = require("os");
const Channel = new (require("../../databases/Channel/manage"))();
const LiveChat = new (require("../../databases/MainLiveChat/manage"))();
const Log = new (require("../../databases/Log/manage"))();
const User = new (require("../../databases/User/manage"))();
const Comment = new (require("../../databases/Comment/manage"))();
const Storage = new (require("../../databases/Storage/manage"))();


function getIp(req){
  return req.headers["x-forwarded-for"]||req.ip;
}

function pageBase(){
  let head = fs.readFileSync('./src/views/home/head','utf8');
  let headerName = fs.readFileSync('./src/views/home/headerName','utf8');
  let foot = fs.readFileSync('./src/views/home/foot','utf8');
  return {head, headerName, foot}
}

function printChannelBoxList(){
  let a = "";
  let b = fs.readFileSync("./src/databases/Channel/info.json",'utf8');
  let c = JSON.parse(b);
  let d = c.channelName;
  for (let i=0; i<d.length; i++){
    a += `<a href="/channel/${c.pathID[i]}" style="margin:20px;"><div class="channelBox">
    ${d[i]}
    </div></a>`;
  }
  a += `<a href="/makeChannel" style="margin:20px;"><div class="channelBox">
  채널 만들기
  </div></a>`;
  return a;
}

const output = {
  main: (req, res) => {
    let connecting = JSON.parse(fs.readFileSync("./src/routes/home/connecting","utf8"));
    let a = LiveChat.printLiveChat();
    res.render('home/index', Object.assign({},pageBase(),{channel: printChannelBoxList(), chat:a[0], n:a[1], connecting:connecting.length}));
  },
  login: (req, res) => {
    res.render('home/login', pageBase());
  },
  makeChannel: (req, res) => {
    res.render('home/makeChannel', pageBase());
  },
  watchArticleList: (req, res) => {
    const a = Channel.getHTMLArticlesList(req.params.pathID,0,getIp(req));
    if (a === "doesn't exist the pathID"){
      res.render('home/error', Object.assign(pageBase(),{info:"존재하지 않는 경로입니다."}));
    } else {
      res.render('home/articleList', Object.assign(pageBase(),a));
    }
  },
  writeForm: (req, res) => {
    res.render('home/writeArticle', pageBase());
  },
  watchArticle: (req, res) => {
    const a = Channel.viewArticle(req.params.pathID,Number(req.params.index),getIp(req));
    if (a.blinded) {
      res.render('home/error', Object.assign(pageBase(),{info:"삭제된 게시글입니다."}));
    } else if (a === "you blocked this ip"){
      res.render('home/error', Object.assign(pageBase(),{info:"당신이 차단한 ip입니다."}));
    } else if (a === "doesn't exist the article"){
      res.render('home/error', Object.assign(pageBase(),{info:"글이 존재하지 않습니다."}));
    } else if (a === "doesn't exist the pathID") {
      res.render('home/error', Object.assign(pageBase(),{info:"잘못된 경로입니다."}));
    } else if (a.index == req.params.index){
      res.render('home/viewArticle', Object.assign(pageBase(),{info:a}));
    } else {
      res.render('home/error', Object.assign(pageBase(),{info:"예기치 못한 에러"}));
    }
  },
  editArticle: (req, res) => {
    const a = Channel.getParsedArticle(req.params.pathID, Number(req.params.index));
    if(!a[0].blinded)res.render('home/editArticle', pageBase());
    else res.render('home/error', Object.assign(pageBase(),{info:"수정할 수 없는 글입니다."}));
  },
  coding: (req, res) => {
    res.render('home/coding', pageBase());
  },
  comment: (req, res) => {
    res.render('home/comment', Object.assign(pageBase()));
  }
};

const process = {
  main: (req, res) => {
    let connecting = JSON.parse(fs.readFileSync("./src/routes/home/connecting","utf8"));
    connecting = connecting.filter(x => {return x.date > (new Date()).getTime()-10000});
    let myid = connecting.findIndex(x => x.ip === getIp(req));
    if(myid === -1){
      connecting.push({ip:getIp(req), date:(new Date()).getTime()});
    } else {
      connecting[myid].date = +new Date;
    }
    fs.writeFileSync("./src/routes/home/connecting",JSON.stringify(connecting));
    if(req.body){
      if(req.body.purpose === "postChat"){
        const a = LiveChat.addChat(req, res);
        res.json(Object.assign({connecting:connecting.length},a));
      } else if (req.body.purpose === "liveChatInfo"){
        const a = LiveChat.liveChatInfo(req, res);
        res.json(Object.assign({connecting:connecting.length},a));
      } else if (req.body.purpose === "getLiveChat") {
        const a = LiveChat.getLiveChat(req, res);
        res.json(Object.assign({connecting:connecting.length},a));
      } else {
        res.json({msg:"요청 목적을 전달받지 못했습니다."});
      }
    } else {
      res.json({connecting:connecting.length,msg:"잘못된 요청입니다."});
    }
  },
  requestToMakeChannel: (req, res) => {
    if (req.body) {
      if (!req.body.title){
        res.json({msg: "title is disable"});
      } else {
        let a = JSON.parse(fs.readFileSync("./src/Notice/notice.json","utf8"));
        let b = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
        if(b.pathID.includes(req.body.pathID)){
          res.json({msg: "pathID already exists"});
        } else if(b.channelName.includes(req.body.title)){
          res.json({msg: "title already exists"});
        } else if (2 > req.body.title.length || req.body.title.length > 10 || /[^a-zA-Z0-9]/.test(req.body.pathID)) {
          res.json({});
        } else {
          a.count += 1;
          fs.writeFileSync("./src/Notice/notice.json",JSON.stringify(a));
          fs.writeFileSync("./src/Notice/"+(a.count-1),JSON.stringify({body:req.body,ip:getIp(req)}));
          res.json({msg: "success"});
        }
      }
    } else {
      res.json({});
    }
  },
  writeArticle: (req, res) => {
    const a = Channel.writeArticle(req.body.path.slice(6),req.body.title,req.body.detail,getIp(req),req.body.hash);
    if(a === "doesn't exist the pathID"){
      res.json({msg: "해당 경로가 존재하지 않습니다."});
    } else if (a === "success") {
      res.json({msg: a});
    } else {
      res.json({msg: "error"});
    }
  },
  articleEdit: (req, res) => {
    if (req.body.type==="init"){
      const a = Channel.viewArticle(req.params.pathID,Number(req.params.index),getIp(req),false);
      if (a === "doesn't exist the pathID") {
        res.json({msg:"존재하지 않는 경로입니다."});
      } else if (a === "doesn't exist the article"){
        res.json({msg:"존재하지 않는 글입니다."});
      } else if (a.index == req.params.index){
        res.json({msg:"success",title:a.title,article:a.article});
      } else {
        res.json({msg:"Error"});
      }
    } else if (req.body.type==="submit"){
      const a = Channel.editArticle(req.params.pathID,Number(req.params.index),req.body.title,req.body.article,req.body.hash);
      res.json({msg:a});
    } else {
      res.json({msg:"Error"});
    }
  },
  articleUpdate: (req, res) => {
    if(req.body.reqType === "refresh"){
      const a = Channel.getParsedArticle(req.params.pathID,Number(req.params.index),true);
      res.json({msg:"success",like:a.article[0].likeCount,dislike:a.article[0].dislikeCount,blocked:a.user.user.blockedTo.length});
    } else if(req.body.reqType === "block"){
      const a = User.blockUser(getIp(req),Channel.getParsedArticle(req.params.pathID,Number(req.params.index),false)[0].writer);
      res.json({msg:a.msg});
    } else if(req.body.reqType === "getComment"){
      const a = Channel.getParsedArticle(req.params.pathID,Number(req.params.index),true);
      res.json({msg:"success",like:a.article[0].likeCount,dislike:a.article[0].dislikeCount,blocked:a.user.user.blockedTo.length});
    } else if (req.body.reqType === "delete"){
      const a = Channel.deleteArticle(req.params.pathID,Number(req.params.index),req.body.hash);
      res.json({msg:a});
    } else if (req.body.reqType === "like" || req.body.reqType === "dislike") {
      const b = Channel.valueArticle(req.params.pathID,Number(req.params.index),getIp(req),req.body.reqType);
      res.json({msg:b});
    } else if (req.body.reqType === "postComment"){
      const a = Comment.makeComment(req.body.root,req.body.content, getIp(req), req.body.pw);
      res.json({});
    } else {
      res.json({msg:"error"})
    }
  },
  comment: (req,res) => {
    if(req.body.reqType==="getComment"){
      const comment = Comment.getComment(req.body.index);
      if(!comment){res.json({msg:"failed1"});return;};
        res.json({msg:"success",comment:Comment.parseComment(comment)});
    } else if (req.body.reqType === "like") {
      const status = Comment.like(req.body.index-0, getIp(req));
      if(status === "success"){
        res.json({msg:"success"});
      } else if (status === "already") {
        res.json({msg:"already"});
      } else {
        res.json({msg:"error"});
      }
    } else if (req.body.reqType === "dislike") {
      const status = Comment.dislike(req.body.index-0, getIp(req));
      if(status === "success"){
        res.json({msg:"success"});
      } else if (status === "already") {
        res.json({msg:"already"});
      } else {
        res.json({msg:"error"});
      }
    } else if (req.body.reqType === "postComment") {
      const status = Comment.makeComment(req.body.parentIndex-0,req.body.content, getIp(req), req.body.pw);
      if (status === "success") {
        res.json({msg:"success"});
      } else {
        res.json({msg:"error"});
      }
    }
    else res.json({msg:"failed3"});
  }
}

const log = (req, res, next) => {
  //Log.mkLog(req, res);
  next();
};

module.exports = {
  output,
  process,
  log
};
