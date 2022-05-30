"use strict";

if (location.pathname !== "/write" || /[^a-zA-Z0-9]/.test(location.search.slice(6))){
  alert("오류가 생겼습니다.");
}

const getElm = function (query){
  return document.querySelectorAll(query);
};

getElm("#path")[0].innerText = "> "+location.search.slice(6);

function send(obj,resFn){
  fetch("/write",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj)
  })
  .then((res) => res.json())
  .then(resFn);
}

getElm("button")[0].addEventListener("click", function(event){
  const obj = {
    path: location.search,
    title: getElm("#title")[0].value,
    detail: getElm("#detail")[0].value,
    hash: sha256(getElm("#pw")[0].value+"adsfsdf")
  };
  if(obj.title.length<1 || obj.detail.length<1){
    alert("제목과 내용을 적어도 1자 이상 작성해주세요.");
    return;
  } else if (getElm("#pw")[0].value.length<1) {
    alert("적어도 1자 이상의 비밀번호를 입력해주세요.");
    return;
  } else {
    send(obj, (res) => {
      if(res.msg === "success"){
        location.href = "/channel/"+location.search.slice(6);
      } else {
        alert(res.msg);
        alert("잘못된 형식입니다.");
      }
    });
  }
});

getElm("button")[1].addEventListener("click", function(event){
  
  location.href = "/channel/"+location.search.slice(6);
  
});
