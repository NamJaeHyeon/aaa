"use strict";

const res = require("express/lib/response");
const fs = require("fs");

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
    a += `<div style="border:1px solid white;height:200px;margin:20px">
    ${d[i]}
    </div>`;
  }
  a += `<div style="border:1px solid white;height:200px;margin:20px">
  채널 만들기
  </div>`;
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
  }
}

module.exports = {
  output,
  process
};

