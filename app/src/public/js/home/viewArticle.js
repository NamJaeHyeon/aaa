"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

function DateToText(t){
  return ((x,y)=>x.getFullYear()+"."+y(x.getMonth()+1)+"."+y(x.getDate())+" "+(z=>(z<12?"오전 ":"오후 ")+y(z<13?z:z-12))(x.getHours())+":"+y(x.getMinutes())+":"+y(x.getSeconds()))(new Date(t),(a) => ("00"+a).slice(-2));
}

function timePassed(t){
  let pass = ((new Date()).getTime() - t)/1000;
  if(pass < 60) {
    return Math.floor(pass) + "초 전";
  } else if (pass < 60*60) {
    return Math.floor(pass/60) + "분 전";
  } else if (pass < 60*60*24) {
    return Math.floor(pass/60/60) + "시간 전";
  } else if (pass < 60*60*24*30) {
    let a = Math.floor(pass/60/60/24/30);
    return Math.floor(pass/60/60/24) + "일" + (a>0 ? "("+a+"달)" : "") + " 전";
  } else if (pass < 60*60*24*365) {
    return Math.floor(pass/60/60/24/365) + "년 전";
  }
}

const articleTime = Number(getElm("#articleDate")[0].innerText);
const articleDate = DateToText(articleTime);

getElm("#nowPath")[0].innerHTML = (x=>{x[0]=`<a style="color:white" href="/channel/${x[0]}">${getElm("#channel_name")[0].innerText}</a>`;return x;})(location.pathname.split("/").slice(2)).join(" > ");

function updateDate(){
  let passed = articleTime-new Date();
  getElm("#time")[0].innerText = timePassed(articleTime) + " (" + articleDate + ")";
  if(passed/1000<60){
    setTimeout(updateDate,1000);
  } else if (passed/1000/60<60){
    setTimeout(updateDate,1000*(60-passed/1000%60));
    console.log((60-passed/1000%60));
  } else if (passed/1000/60/60/24<24){
    setTimeout(updateDate,1000*60*(60-passed/1000/60%60));
  }
}
updateDate();

function send(path,obj,resFn){
  fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj)
  })
  .then((res) => res.json())
  .then(resFn);
}

getElm("#like-button")[0].addEventListener("click", function(event){
  send(location.pathname, {reqType:"like"}, (res) => {
    console.log(res);
    if(res.msg === "success"){
      alert("좋아요가 눌렸습니다.");
      location.reload();
    } else if (res.msg === "already like"){
      alert("같은 ip가 이미 좋아요를 눌렀습니다.");
    } else {
      alert("error");
    }
  });
});

getElm("#dislike-button")[0].addEventListener("click", function(event){
  send(location.pathname, {reqType:"dislike"}, (res) => {
    console.log(res);
    if (res.msg === "success"){
      alert("싫어요가 눌렸습니다.");
      location.reload();
    } else if (res.msg === "already dislike"){
      alert("같은 ip가 이미 싫어요를 눌렀습니다.");
    } else {
      alert("error");
    }
  });
});

getElm("#block")[0].addEventListener("click", function(event){
  send(location.pathname, {reqType:"block"}, (res) => {
    if (res.msg === "success"){
      alert("해당 아이피를 차단하였습니다.");
      location.href=location.pathname.split("/").slice(0,-1).join("/");
    } else if(res.msg === "can't block yourself"){
      alert("자신의 ip를 차단할 수 없습니다.");
    } else {
      alert("error");
    }
  });
});

getElm("#share")[0].addEventListener("click", function(event){
  navigator.clipboard.writeText(location.href);
  alert("링크가 복사되었습니다.\n"+location.href);
});

getElm("#edit")[0].addEventListener("click", function(event){
  location.href = location.pathname+"/edit";
});

getElm("#delete")[0].addEventListener("click", function(event){
  const pw = prompt("비밀번호 입력");
  const obj = {
    reqType: "delete",
    hash: sha256(pw+"adsfsdf")
  };
  send(location.pathname, obj, (res) => {
    if(res.msg === "success"){
      alert("삭제되었습니다.");
      location.href = (x=>{x.pop();return x;})(location.pathname.split("/")).join("/");
    } else if (res.msg === "mismatched password"){
      alert("비밀번호가 잘못되었습니다.");
    } else {
      alert("error");
    }
  });
});

function refresh(){
  send(location.pathname, {reqType:"refresh"}, (res) => {
    if(res.msg === "success"){
      getElm("#like_count")[0].innerText = res.like;
      getElm("#dislike_count")[0].innerText = res.dislike;
      getElm("#block")[0].innerText = "차단 "+res.blocked;
    } else {
      alert("error");
    }
  });
}

setInterval(refresh,10000);
