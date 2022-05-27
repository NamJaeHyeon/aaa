"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

function send(obj,resFn){
  fetch("/makeChannel",{
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
    title: getElm("#title")[0].value,
    explain: getElm("#explain")[0].value,
    email: getElm("#email")[0].value,
    pathID: getElm("#pathID")[0].value
  };
  let check = /[^a-zA-Z0-9]/;
  if (2 > obj.title.length || obj.title.length > 10) {
    alert("제목을 2자 이상 10자 이하로 작성해주세요.");
    return;
  } else if (check.test(obj.pathID)) {
    alert("pathID를 영어와 숫자로만 작성해주세요.");
    return;
  } else {
    send(obj, (res) => {
      console.log(res);
      if(res.msg === "success"){
        alert("신청 완료되었습니다.");
        location.href = "/";
      } else if (res.msg === "title is disable") {
        alert("해당 제목은 신청 불가능합니다.");
      } else if (res.msg == "pathID already exists") {
        alert("해당 path id는 이미 존재합니다.");
      } else if (res.msg == "title already exists") {
        alert("해당 제목은 이미 존재합니다.");
      } else {
        alert("Unexpected Input!");
        location.href = "/";
      }
    });
  }
});