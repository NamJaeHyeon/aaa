"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

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

getElm("#edit")[0].addEventListener("click", function(event){
  location.href = location.pathname+"/edit";
});

getElm("#delete")[0].addEventListener("click", function(event){
  const obj = {
    hash: sha256(prompt("비밀번호 입력")+"adsfsdf")
  };
  send("/delete", obj, (res) => {
    ;
  });
});