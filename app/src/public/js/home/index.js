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
          send({purpose: "getLiveChat", index: i}, (res0) => {
            if (res0.msg === "success") {
              console.log(res0);
              let a = getElm("#getLive")[0];
              a.innerHTML = `<div>
              <span style="font-size:15px;float:left;width:100px">${res0.writer}</span>
              <span style="font-size:15px;float:right;width:400px;overflow:hidden;text-overflow:ellipsis;">${res0.t}</span>
            </div>
            ` + a.innerHTML;
              if(getElm("#getLive > div").length>15)getElm("#getLive")[0].removeChild(getElm("#getLive > div")[getElm("#getLive > div").length-1]);
            }
          })
          console.log(res);
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

// function updateDate(){
//   getElm("#date")[0].innerHTML = ((x,y)=>x.getFullYear()+"년 "+y(x.getMonth()+1)+"월 "+y(x.getDate())+"일<br>"+y(x.getHours())+"시 "+y(x.getMinutes())+"분 "+y(x.getSeconds())+"초")(new Date(),(a) => ("00"+a).slice(-2));
// }

setInterval(liveChatUpdate,3*1000);
