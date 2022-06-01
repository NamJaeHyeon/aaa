"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

getElm("#path")[0].innerHTML = (x=>{[x[0],x[1],x[2]]=[`<a href="/channel/${x[0]}">${x[0]}</a>`,`<a href="/channel/${x[0]}/${x[1]}">${x[1]}</a>`,"수정"];return x;})(location.pathname.split("/").slice(2)).join(" &gt; ");

function send(path, obj, resFn){
  fetch(path,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj)
  })
  .then((res) => res.json())
  .then(resFn);
}

send(location.pathname,{type:"init"},(res) => {
  console.log(res);
  if(res.msg === "삭제된 게시글입니다."){
    alert(res.msg);
    location.href = location.pathname.split("/").slice(0,-1).join("/");
  } else if (res.msg === "success") {
    getElm("[name=title]")[0].value = res.title;
    getElm("#detail")[0].innerHTML = res.article;
  }
});

getElm("button")[0].addEventListener("click", function(event){
  const obj = {
    type: "submit",
    path: location.search,
    title: getElm("#title")[0].value,
    article: getElm("#detail")[0].value,
    hash: sha256(getElm("#pw")[0].value+"adsfsdf")
  };
  if(obj.title.length<1 || obj.article.length<1){
    alert("제목과 내용을 적어도 1자 이상 작성해주세요.");
    return;
  } else if (getElm("#pw")[0].value.length<4) {
    alert("적어도 4자 이상의 비밀번호를 입력해주세요.");
    return;
  } else {
    send(location.pathname, obj, (res) => {
      if(res.msg === "success"){
        location.href = "/channel/"+location.pathname.split("/").slice(2,4).join("/");
      } else if (res.msg === "the article is blinded") {
        alert("삭제된 게시글 입니다.");
        location.href = "/channel/"+location.pathname.split("/")[2];
      } else if (res.msg === "unable title length") {
        alert("제목의 길이는 1자 이상 30자 이하로 제한되어있니다.");
      } else if (res.msg === "unable article length") {
        alert("내용의 길이는 1자 이상 1000자 이하로 제한되어있니다.");
      } else if (res.msg === "mismatched password") {
        alert("일치하지 않는 비밀번호입니다.");
      } else {
        alert(res.msg);
        alert("알 수 없는 오류");
      }
    });
  }
});
