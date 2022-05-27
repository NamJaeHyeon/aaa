"use strict";

const res = require("express/lib/response");
const fs = require("fs");
const crypto = require('crypto');

function sha256(value) {
  return crypto.createHmac('sha256', "소프트웨어 시장 씹어먹자 ㅋㅋ").update(value).digest('hex')
}

function blindIP(ip){
  return ((x) => (y => `${y[0]}.${y[1]}.*.*`)(x.split(".")))(ip);
}

function pageBase(){
  let head = fs.readFileSync('./src/views/home/head','utf8');
  let headerName = fs.readFileSync('./src/views/home/headerName','utf8');
  let foot = fs.readFileSync('./src/views/home/foot','utf8');
  return {head, headerName, foot}
}

function printChannelList(){
  let a = "";
  let b = fs.readFileSync("./src/databases/Channel/info.json",'utf8');
  let c = JSON.parse(b);
  let d = c.channelName;
  for (let i=0; i<d.length; i++){
    a += `<a href="/c/board" style="margin:20px;"><div style="border:1px solid white;height:200px;">
    ${d[i]}
    </div></a>`;
  }
  a += `<a href="/makeChannel" style="margin:20px;"><div style="border:1px solid white;height:200px;">
  채널 만들기
  </div></a>`;
  return a;
}

function printLiveChat(){
  let t = "";
  let a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
  let b = a.count;
  for(let i=b-1; i >= (b-15>=0 ? b-15:0);i--) t+=`
            <div>
              <span style="font-size:15px;float:left;width:140px">${blindIP(a.writer[i])}</span>
              <span style="font-size:15px;float:right;width:580px;overflow:hidden;text-overflow:ellipsis;">${fs.readFileSync("./src/databases/MainLiveChat/"+i,"utf8").replace(/\>/g,"&gt").replace(/\</g,"&lt").replace(/\"/g,"&quot").replace(/\'/g,"&#39")}</span>
            </div>`;
  return [t,b];
}

function postChat(req, res){
  if(req.body.liveChat){
    if(typeof(req.body.liveChat) === "string" && (req.body.liveChat.length>0 && req.body.liveChat.length<=100)){
      const a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
      a.count += 1;
      a.writer.push(req.headers["x-forwarded-for"]||req.ip);
      fs.writeFileSync("./src/databases/MainLiveChat/"+(a.count-1),req.body.liveChat);
      fs.writeFileSync("./src/databases/MainLiveChat/info.json",JSON.stringify(a));
      res.json({msg:"success"});
    } else {
      res.json({msg:"잘못된 요청입니다."});
    }
  }
}

function liveChatInfo(req, res){
  const a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
  res.json({msg:"success",count:a.count})
}

function getLiveChat(req, res){
  const a = JSON.parse(fs.readFileSync("./src/databases/MainLiveChat/info.json","utf8"));
  if (a.count > req.body.index && Number.isInteger(req.body.index) && req.body.index > 0) {
    const b = fs.readFileSync("./src/databases/MainLiveChat/"+req.body.index,"utf8");
    res.json({msg:"success", writer:blindIP(a.writer[req.body.index]), t: b});
  } else {
    res.json({msg:"잘못된 요청입니다."});
  }
}

function reqChannelList(pathID,page){
  let t = "";
  let a = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/info.json`,"utf8"));
  let startIndex = 0, endIndex = 0;
  if(!page){
    startIndex = a.articleCount-1;
    endIndex = (a.articleCount-50>0?a.articleCount-50:0);
  }
  for(let i = startIndex; i >= endIndex; i--){
    let b = JSON.parse(fs.readFileSync(`./src/databases/Channel/${pathID}/${i}.json`,"utf8"));
    t += `<div>${i}</div><div><a href="/c/${pathID}/${i}">${b.title}</a></div><div>${b.writer}</div><div>${b.value}</div>
    `;
  }
  return t;
}

const output = {
  main: (req, res) => {
    //res.render('home/index', Object.assign(pageBase(),));
    let a = printLiveChat();
    res.render('home/index', Object.assign(pageBase(),{channel: printChannelList(), chat: a[0], n: a[1]}));
  },
  login: (req, res) => {
    res.render('home/login', pageBase());
  },
  makeChannel: (req, res) => {
    res.render('home/makeChannel', pageBase());
  },
  watchChannelMain: (req, res) => {
    let a = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
    if(a.pathID.includes(req.params.pathID)){
      let b = a.pathID.indexOf(req.params.pathID);
      res.render('home/inChannel', Object.assign(pageBase(),{chli: reqChannelList(req.params.pathID), channelName: a.channelName[b]}));
    } else {
      res.send();
    }
  },
  writeForm: (req, res) => {
    res.render('home/writeArticle', pageBase());
  },
  watchArticle: (req, res) => {
    let a = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
    if(!a.pathID.includes(req.params.pathID)){
      res.redirect("/");
    } else {
      let b = JSON.parse(fs.readFileSync("./src/databases/Channel/"+req.params.pathID+"/info.json","utf8"));
      if (Number.isInteger(+req.params.index) && req.params.index >= 0 && req.params.index < b.articleCount){
        res.render('home/viewArticle', Object.assign(pageBase(),{
          info: JSON.parse(fs.readFileSync("./src/databases/Channel/"+req.params.pathID+"/"+req.params.index+".json","utf8")),
          detail: fs.readFileSync("./src/databases/Channel/"+req.params.pathID+"/"+req.params.index,"utf8").replace(/\>/g,"&gt").replace(/\</g,"&lt").replace(/\"/g,"&quot").replace(/\'/g,"&#39").replace(/\n/g,"<br>")}));
      } else {
        res.send();
      }
    }
  }
};

const process = {
  main: (req, res) => {
    if(req.body){
      if(req.body.purpose === "postChat"){
        postChat(req, res);
      } else if (req.body.purpose === "liveChatInfo"){
        liveChatInfo(req, res);
      } else if (req.body.purpose === "getLiveChat") {
        getLiveChat(req, res);
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
    if(typeof(req.body.path)==="string"){
      let a = req.body.path.slice(6);
      if(!/[^a-zA-Z0-9]/.test(a)){
        if(typeof(req.body.title)==="string"&&typeof(req.body.detail)==="string"&&req.body.title.length&&req.body.detail.length) {
          let b = JSON.parse(fs.readFileSync("./src/databases/Channel/info.json","utf8"));
          if (b.pathID.includes(a)) {
            let c = JSON.parse(fs.readFileSync("./src/databases/Channel/"+a+"/info.json","utf8"));
            let d = {
              "title": req.body.title,
              "digitalSignature": "",
              "digitalSignature_plain": "",
              "publicKey": "",
              "writer": blindIP(req.headers["x-forwarded-for"]||req.ip),
              "value": 0,
              "voter": [],
              "hash": sha256(req.body.hash)
            };
            fs.writeFileSync("./src/databases/Channel/"+a+"/"+c.articleCount,req.body.detail);
            fs.writeFileSync("./src/databases/Channel/"+a+"/"+c.articleCount+".json",JSON.stringify(d));
            c.articleCount += 1;
            fs.writeFileSync("./src/databases/Channel/"+a+"/info.json",JSON.stringify(c));
          }
          res.json({msg: "success"});
        }
      } else {
        res.json({msg: "error"});
      }
    } else {
      res.json({msg: "error"});
    }
  }
}

module.exports = {
  output,
  process
};

