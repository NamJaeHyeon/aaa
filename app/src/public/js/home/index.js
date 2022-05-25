"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};
const chatSpace = getElm("#Lchat")[0];
let chatCount = Number(getElm("#values")[0].innerText);

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

function sendLoginForm(){
  send({requestType: "login", id: getElm("#id")[0].value, pw: getElm("#pw").value},(res) => {
    alert("아직 로그인 기능이 없습니다.");
  });
}

function liveChatUpdate(){
  send({purpose: "liveChatInfo"}, (res) => {
    if (res.msg === "success") {
      if (res.count !== chatCount) {
        for (let i = res.count<chatCount+15 ? chatCount:res.count-15; i<res.count; i++){
          send({purpose: "getLiveChat", index: i}, (res) => {
            if (res.success) {
              console.log(res);
              let a = getElm("#getLive");
              a.innerHTML = `<div>
              <span style="font-size:15px;float:left;width:70px">${res.writer}</span>
              <span style="font-size:15px;float:right;width:650px;overflow:hidden;text-overflow:ellipsis;">${res.t}</span>
            </div>
            ` + a.innerHTML;
            }
          })
        }
        chatCount = res.count;
        console.log("updated!", res);
      }
    }
  });
}

chatSpace.addEventListener("keypress", function(event){
  if(event.key === "Enter"){
    const obj = {
      purpose: "postChat",
      liveChat: chatSpace.value
    };
    send(obj, (res) => {
      if(res.msg === "success")
        location.href = "/";
      else alert(res.msg);
    });
  }
});

setInterval(liveChatUpdate,3*1000);