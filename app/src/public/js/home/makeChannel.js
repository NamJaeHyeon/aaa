"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

function send(obj,resFn){
  fetch("/",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj)
  })
  .then((res) => res.json())
  .then(resFn);
}

getElm("button")[0].addEventListener("onclick", function(event){
  const obj = {
    title: getElm("#title")[0].value,
    explain: getElm("#explain")[0].value,
    email: getElm("#email")[0].value
  };
  send(obj, (res) => {
    if(res.msg === "success"){
      alert("신청 완료되었습니다.");
      location.href = "/";
    } else if (res.msg === "title is disable") {
      alert("해당 제목은 신청 불가능합니다.");
    } else {
      alert("에러...");
      location.href = "/";
    }
  });
});