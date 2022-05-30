"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

getElm("#nowPath")[0].innerHTML = (x=>{x[1]=`<a href="/channel/${x[1]}">${x[1]}</a>`;return x;})(location.pathname.slice(1).split("/")).join(" > ");

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
    if(res.msg === "like success"){
      alert("좋아요가 눌렸습니다.");
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
    if (res.msg === "dislike success"){
      alert("싫어요가 눌렸습니다.");
    } else if (res.msg === "already dislike"){
      alert("같은 ip가 이미 싫어요를 눌렀습니다.");
    } else {
      alert("error");
    }
  });
});

getElm("#edit")[0].addEventListener("click", function(event){
  location.href = location.pathname+"/edit";
});

getElm("#delete")[0].addEventListener("click", function(event){
  const pw = prompt("비밀번호 입력");
  const obj = {
    hash: sha256(pw+"adsfsdf")
  };
  send(location.pathname, obj, (res) => {
    if(res.msg === "success"){
      alert("삭제되었습니다.");
      location.href = (x=>{x.pop();return x;})(location.pathname.split("/")).join("/");
    } else if (res.msg === "wrongPW"){
      alert("비밀번호가 잘못되었습니다.");
    } else {
      alert("error");
    }
  });
});