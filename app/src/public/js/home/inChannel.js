"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

getElm("#writeArticle")[0].addEventListener("click", function(event){
  location.href = location.origin+"/write?path="+location.pathname.slice(3);
});