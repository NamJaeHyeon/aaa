"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

function send(obj,resFn){
  fetch(location.pathname,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj)
  })
  .then((res) => res.json())
  .then(resFn);
}

if (location.pathname.split("/").length===3){
  send({reqType:"getComment",index:location.pathname.split("/")[2]},(res) => {
    if(res.msg==="success"){
      console.log(res.comment);
      getElm("#content")[0].innerText = res.comment.content;
      getElm("#likeCount")[0].value = "좋아요 " + res.comment.likeCount;
      getElm("#dislikeCount")[0].value = "싫어요 " + res.comment.dislikeCount;
    };
  });
}
