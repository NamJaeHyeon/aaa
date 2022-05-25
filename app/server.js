const express = require('express');
const { json } = require('express/lib/response');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const NodeRSA = require('node-rsa');
const helmet = require('helmet');
app.use(helmet());

let consoleLog = '';
let mkArr = function(a){let k=0; return Array(a).fill(0).map(x => k++)};
let cl = x=>{console.log(x); if(!!x)fs.writeFileSync('./data/accessLog/temp.txt',typeof(x)=='string'?x:JSON.stringify(x)); return x;};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.listen(80, function(){
  console.log('listening on 80...');
});


app.get('/favicon.ico',function(req, res){
  res.send(fs.readFileSync('favicon.ico'));
});

app.get('/favicon.png',function(req,res){
  res.send(fs.readFileSync('favicon.png'));
})


app.post('/',function(요청, 응답){
  let postLog = fs.readFileSync('./data/accessLog/postLog.txt','utf8');
  if(!요청.body.liveChat || typeof(요청.body.liveChat)!='string' || 요청.body.liveChat.length>100){
    fs.writeFileSync('./data/accessLog/postLog.txt',postLog+`
${요청.headers["x-forwarded-for"]} || ${Date()} || POST "./" || bad request
  : ${JSON.stringify(요청)}`);
    응답.redirect('/');
  }else{
    let jsonFile = fs.readFileSync('./data/comments/comments.json', 'utf8');
    let jsonData = JSON.parse(jsonFile);
    let dataToWrite = {
      "index" : jsonData.count,
      "vertex_forward" : 0,
      "vertex_back" : "Main",
      "referred" : [],
      "referTo" : [],
      "nickName" : (((a)=>{return a[0]+"."+a[1]+".*.*"})((요청.headers["x-forwarded-for"] || 요청.ip).split(/[\.:]/g))),
      "ip" : 요청.headers["x-forwarded-for"] || 요청.ip,
      "date" : "",
      "edit" : 0,
      "publicKey" : ""
    };
    fs.mkdirSync(`./data/comments/${jsonData.count}`, { recursive: true })
    fs.writeFileSync(`./data/comments/${jsonData.count}/text`, 요청.body.liveChat);
    fs.writeFileSync(`./data/comments/${jsonData.count}/data.json`, JSON.stringify(dataToWrite));
    jsonData.count += 1;
    fs.writeFileSync("./data/comments/comments.json",JSON.stringify(jsonData));
    fs.writeFileSync('./data/accessLog/postLog.txt',postLog+`
${요청.headers["x-forwarded-for"] || 요청.ip} || ${Date()} || POST "./" || success || ${요청.body.liveChat}`);
    응답.redirect('/');
  }
});

function writeGetLog(req){
  console.log(req.url);
  let getLog = fs.readFileSync("./data/accessLog/getLog.txt","utf8");
  fs.writeFileSync("./data/accessLog/getLog.txt",getLog+`
${req.headers["x-forwarded-for"]||req.ip} || ${Date()} || GET "${req.url}"`);
}

app.get('/login',function(req, res){
  writeGetLog(req);
  res.send(`<!DOCTYPE html>
  <html lang="ko">
    <head>
      ${fs.readFileSync('./head','utf8')}
      <style>
        * {
          color:white;
        }
        .base-border{
          border-width: 1px 0 0 1px;
          border-color: white;
        }
      </style>
    </head>
    <body style="background-color:black">
      <header alt="네비게이터">
        <nav class="navbar fixed-top navbar-light bg-dark">
          <div class="container-fluid">
            <a class="navbar-brand" href="./" style="color:white;margin-left:30px" alt="메인으로"><span style="font-size:40px">𝕴𝖓𝖋𝖊𝖗</span><span style="font-size:28px; margin-left:10px">𝕷𝖎𝖇𝖊𝖗𝖆𝖑</span></a>
          </div>
        </nav>
      </header>
      <div style="padding-top: 83px"></div>
      
      <div style="position:relative;margin:50px auto;width:1060px;">
        <div style="border:1px solid black;height:1060px;text-align:center">
          <div style="font-size:70px;margin:200px 0">로그인</div>
          <div style="font-size:30px;text-align:left;display:inline-block;width:500px">
            <div style="float:left;display:inline-block">아이디</div><div style="float:right;display:inline-block"><input type="text" name="id"></div>
            <div style="padding-top:52px;display:inline-block"></div>
            <div style="float:left;display:inline-block">비밀번호</div><div style="float:right;display:inline-block"><input type="text" name="pw"></div>
          </div>
        </div>
        <a href="./register">회원가입</a>
      </div>

      ${fs.readFileSync('./foot',"utf8")}
    </body>
    </html>`);
})

app.get('/channel/:name/:id',function(req,res){

  res.send('');
})

app.get('/makeChannel',function(req, res){
  res.send(`<!DOCTYPE html>
  <html lang="ko">
    <head>
      ${fs.readFileSync('./head','utf8')}
      <style>
        * {
          color:white;
        }
        .base-border{
          border-width: 1px 0 0 1px;
          border-color: white;
        }
      </style>
    </head>
    <body style="background-color:black">
      <header alt="네비게이터">
        <nav class="navbar fixed-top navbar-light bg-dark">
          <div class="container-fluid">
            <a class="navbar-brand" href="./" style="color:white;margin-left:30px" alt="메인으로">${fs.readFileSync('./headerName','utf8')}</a>
            <a class="navbar-brand" href="./login" style="color:white;" alt="로그인" style="float:right">로그인</a>
          </div>
        </nav>
      </header>
      <div style="padding-top: 183px"></div>
      
      <div style="margin: 50 auto;display:inline-block;width:1500px;border:1px solid white;position:relative;">
        <div>llll</div>
      </div>
      
      ${fs.readFileSync('./foot',"utf8")}
    </body>
    </html>`);
})

app.get('/', function(요청, 응답){
  writeGetLog(요청);

  function printLiveChat(){
    let t = "";
    let comments = JSON.parse(fs.readFileSync("./data/comments/comments.json","utf8"));
    for(let i=comments.count-1; i>=comments.count-15;i--) t+=`
              <div>
                <span style="font-size:15px;float:left;width:70px">${JSON.parse(fs.readFileSync("./data/comments/"+i+"/data.json","utf8")).nickName}</span>
                <span style="font-size:15px;float:right;width:650px;overflow:hidden;text-overflow:ellipsis;">${fs.readFileSync("./data/comments/"+i+"/text","utf8").replace(/\>/g,"&gt").replace(/\</g,"&lt").replace(/\"/g,"&quot").replace(/\'/g,"&#39")}</span>
              </div>`;
    return t;
  }
  응답.send(`<!DOCTYPE html>
  <html lang="ko">
    <head>
      ${fs.readFileSync('./head','utf8')}
      <style>
        * {
          color:white;
        }
        .base-border{
          border-width: 1px 0 0 1px;
          border-color: white;
        }
      </style>
    </head>
    <body style="background-color:black">
      <header alt="네비게이터">
        <nav class="navbar fixed-top navbar-light bg-dark">
          <div class="container-fluid">
            <a class="navbar-brand" href="./" style="color:white;margin-left:30px" alt="메인으로">${fs.readFileSync('./headerName','utf8')}</a>
            <a class="navbar-brand" href="./login" style="color:white;" alt="로그인" style="float:right">로그인</a>
          </div>
        </nav>
      </header>
      <div style="padding-top: 183px"></div>
      
      <div style="position:relative;margin:50px auto;width:1500px;height:500px">
        <div style="border: 1px solid black;">
        <div alt="실시간 베스트" style="float:left;width:725px;">
          <div style="font-size:50px">실시간 베스트</div>
        </div>
        <div alt="실시간 채팅" style="float:right;width:725px;">
          <div style="font-size:50px">실시간 채팅</div>
          <div style="padding-top:40px;"></div>
          <form action="./" method="post">
            <input type="text" name="liveChat" maxlength="100" style="background-color:black;border-color:black black white black;border-width:0 0 1px 0;width:720px;" placeholder="채팅을 입력하세요.">
            <input type="submit" style="position: absolute; left: -9999px">
          </form>
          ${printLiveChat()}
        </div>
        </div>
      </div>

      <div style="position:relative;margin:50px auto;width:1500px;height:1000px">
        <div style="border: 1px solid black;text-align:center">
          <span style="font-size:50px;">채널</span>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;">
            <div style="border:1px solid white;height:200px;margin:20px">
            프로그래밍
            </div>
            <div style="border:1px solid white;height:200px;margin:20px">
            경제
            </div>
            <div style="border:1px solid white;height:200px;margin:20px">
            정치
            </div>
            <div style="border:1px solid white;height:200px;margin:20px">
            잡담
            </div>
            <div style="border:1px solid white;height:200px;margin:20px">
            잡담
            </div>
          </div>
          <div style="width:800px;font-size:60px;display:inline-block">
            <a href="#"><span style="float:left">&ltLeft</span></a>
            <a href="#"><span style="float:right">right&gt</span></a>
          </div>
        </div>
      </div>
      
      ${fs.readFileSync('./foot',"utf8")}
    </body>
    </html>`);
    //응답.sendFile(__dirname + '/index.html');
})
