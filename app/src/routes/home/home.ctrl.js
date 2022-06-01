"use strict";

const res = require("express/lib/response");
const fs = require("fs");
const Channel = new (require("../../databases/Channel/manage"))();
const LiveChat = new (require("../../databases/MainLiveChat/manage"))();
const Log = new (require("../../databases/Log/manage"))();
let connecting = [];

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
    const a = Channel.getHTMLArticlesList(req.params.pathID,0);
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
    const a = Channel.viewArticle(req.params.pathID,Number(req.params.index),req.headers["x-forwarded-for"]||req.ip);
    if (a.blinded) {
      res.render('home/error', Object.assign(pageBase(),{info:"삭제된 게시글입니다."}));
    } else if (a === "doesn't exist the article"){
      res.render('home/error', Object.assign(pageBase(),{info:"글이 존재하지 않습니다."}));
    } else if (a === "doesn't exist the pathID") {
      res.render('home/error', Object.assign(pageBase(),{info:"잘못된 경로입니다."}));
    } else if (a.index == req.params.index){
      res.render('home/viewArticle', Object.assign(pageBase(),{info:a}));
    } else {
      res.render('home/viewArticle', Object.assign(pageBase(),{info:"예기치 못한 에러"}));
    }
  },
  editArticle: (req, res) => {
    res.render('home/editArticle', pageBase());
  }
};

const process = {
  main: (req, res) => {
    connecting = connecting.filter(x => {return x.date > (new Date()).getTime()-10000});
    let myid = connecting.findIndex(x => x.ip === req.headers["x-forwarded-for"]||req.ip);
    if(myid === -1){
      connecting.push({ip:req.headers["x-forwarded-for"]||req.ip, date:(new Date()).getTime()});
    } else {
      connecting[myid].date = (new Date()).getTime();
    }
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
          fs.writeFileSync("./src/Notice/"+(a.count-1),JSON.stringify({body:req.body,ip:req.headers["x-forwarded-for"]||req.ip}));
          res.json({msg: "success"});
        }
      }
    } else {
      res.json({});
    }
  },
  writeArticle: (req, res) => {
    const a = Channel.writeArticle(req.body.path.slice(6),req.body.title,req.body.detail,req.headers["x-forwarded-for"]||req.ip,req.body.hash);
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
      const a = Channel.viewArticle(req.params.pathID,Number(req.params.index),req.headers["x-forwarded-for"]||req.ip,false);
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
      res.json({msg:"Error"})
    }
  },
  articleUpdate: (req, res) => {
    if(req.body.reqType === "delete"){
      const a = Channel.deleteArticle(req.params.pathID,Number(req.params.index),req.body.hash);
      res.json({msg:a});
    } else if (req.body.reqType === "like" || req.body.reqType === "dislike") {
      const b = Channel.valueArticle(req.params.pathID,Number(req.params.index),req.headers["x-forwarded-for"]||req.ip,req.body.reqType);
      res.json({msg:b});
    } else {
      res.json({msg:"error"})
    }
  }
}

const log = (req, res, next) => {
  Log.mkLog(req, res);
  next();
};

module.exports = {
  output,
  process,
  log
};

