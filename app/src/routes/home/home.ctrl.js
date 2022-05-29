"use strict";

const res = require("express/lib/response");
const fs = require("fs");
const Channel = new (require("../../databases/Channel/manage"))();
const LiveChat = new (require("../../databases/MainLiveChat/manage"))();
const Log = new (require("../../databases/Log/manage"))();

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
    res.render('home/index', Object.assign({},pageBase(),{channel: printChannelBoxList(), chat: a[0], n: a[1]}));
  },
  login: (req, res) => {
    res.render('home/login', pageBase());
  },
  makeChannel: (req, res) => {
    res.render('home/makeChannel', pageBase());
  },
  watchArticleList: (req, res) => {
    const a = Channel.makeArticleHtmlList(req.params.pathID,0);
    res.render('home/articleList', Object.assign({},pageBase(),a));
  },
  writeForm: (req, res) => {
    res.render('home/writeArticle', pageBase());
  },
  watchArticle: (req, res) => {
    const a = Channel.getArticle(req.params.pathID,req.params.index);
    if (a) res.render('home/viewArticle', Object.assign({},pageBase(),{title:a.title,detail:a.article}));
    else {
      res.send("Error");
    }
  },
  editArticle: (req, res) => {
    res.render('home/editArticle', pageBase());
  }
};

const process = {
  main: (req, res) => {
    if(req.body){
      if(req.body.purpose === "postChat"){
        LiveChat.addChat(req, res);
      } else if (req.body.purpose === "liveChatInfo"){
        LiveChat.liveChatInfo(req, res);
      } else if (req.body.purpose === "getLiveChat") {
        LiveChat.getLiveChat(req, res);
      } else {
        res.json({msg:"요청 목적을 전달받지 못했습니다."});
      }
    } else {
      res.json({msg:"잘못된 요청입니다."});
    }
  },
  requestToMakeChannel: (req, res) => {
    if (req.body) {
      if (!req.body.title){
        res.json({msg: "title is disable"});
      } else {
        let a = JSON.parse(fs.readFileSync("./src/Notice/notice.json","utf8"));
        let b = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
        console.log(b,req.body);
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
    const a = Channel.writeArticle(req.body.path.slice(6),req.body.title,req.headers["x-forwarded-for"]||req.ip,req.body.detail,undefined,req.body.hash,[]);
    if(a){
      res.json(a);
    } else {
      res.json({msg: "error"});
    }
  },
  articleManage: (req, res) => {
    res.send();
  },
  delete: (req, res) => {
    res.send();
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

