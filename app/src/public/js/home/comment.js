"use strict";

const getElm = function (query){
  return document.querySelectorAll(query);
};

function DateToText(t){
  return ((x,y)=>x.getFullYear()+"."+y(x.getMonth()+1)+"."+y(x.getDate())+" "+(z=>(z<12?"오전 ":"오후 ")+y(z<13?z:z-12))(x.getHours())+":"+y(x.getMinutes())+":"+y(x.getSeconds()))(new Date(t),(a) => ("00"+a).slice(-2));
}

function timePassed(t){
  let pass = ((new Date()).getTime() - t)/1000;
  if(pass < 60) {
    return Math.floor(pass) + "초 전";
  } else if (pass < 60*60) {
    return Math.floor(pass/60) + "분 전";
  } else if (pass < 60*60*24) {
    return Math.floor(pass/60/60) + "시간 전";
  } else if (pass < 60*60*24*30) {
    let a = Math.floor(pass/60/60/24/30);
    return Math.floor(pass/60/60/24) + "일" + (a>0 ? "("+a+"달)" : "") + " 전";
  } else if (pass < 60*60*24*365) {
    return Math.floor(pass/60/60/24/365) + "년 전";
  }
}

function updateDate(articleTime,elementNode){
  let passed = new Date()-articleTime;
  elementNode.innerText = timePassed(articleTime) + " (" + DateToText(articleTime) + ")";
  if(passed/1000<60){
    setTimeout(updateDate,1000,articleTime,elementNode);
  } else if (passed/1000/60<60){
    setTimeout(updateDate,1000*(60-passed/1000%60),articleTime,elementNode);
  } else if (passed/1000/60/60/24<24){
    setTimeout(updateDate,1000*60*(60-passed/1000/60%60),articleTime,elementNode);
  }
}

function makeCard(info, iterate, parentElement){
  const make_br = ()=>document.createElement("br");
  const div_date = document.createElement("div");
  div_date.style = "float:right;";
  const span_date = document.createElement("span");
  span_date.id = "date"+info.index;
  span_date.appendChild(document.createTextNode(new Date(info.date)));
  div_date.appendChild(span_date);

  const inputButton1 = document.createElement("input");
  inputButton1.className = "background-color-white";
  inputButton1.id = "likeCount"+info.index;
  inputButton1.type = "button";
  inputButton1.value = "좋아요 "+info.likeCount;
  inputButton1.onclick = function () {
    send({reqType: "like", index: info.index}, (res) => {
      if (res.msg === "success"){
        location.reload();
      } else if (res.msg === "already"){
        alert("이미 같은 ip가 좋아요를 눌렀습니다.");
      } else {
        alert("error");
      }
    })
  };
  const inputButton2 = document.createElement("input");
  inputButton2.className = "background-color-white";
  inputButton2.id = "dislikeCount"+info.index;
  inputButton2.type = "button";
  inputButton2.value = "싫어요 "+info.dislikeCount;
  inputButton2.onclick = function () {
    send({reqType: "dislike", index: info.index}, (res) => {
      if (res.msg === "success"){
        location.reload();
      } else if (res.msg === "already"){
        alert("이미 같은 ip가 싫어요를 눌렀습니다.");
      } else {
        alert("error");
      }
    })
  };
  // const inputButton3 = document.createElement("input");
  // inputButton3.className = "background-color-white";
  // inputButton3.type = "button";
  // inputButton3.value = "공유";
  const inputButton4 = document.createElement("input");
  inputButton4.className = "background-color-white";
  inputButton4.type = "button";
  inputButton4.value = "수정";
  // inputButton4.onclick = function () {
  //   const pw = prompt("비밀번호");
  //   send({reqType: "edit", index: info.index, hash: sha256(pw)}, (res) => {
  //     if (res.msg === "success"){
  //       alert("싫어요가 눌렸습니다.");
  //     } else if (res.msg === "already clicked"){
  //       alert("이미 같은 ip가 싫어요를 눌렀습니다.");
  //     } else {
  //       alert("error");
  //     }
  //   })
  // };
  const inputButton5 = document.createElement("input");
  inputButton5.className = "background-color-white";
  inputButton5.type = "button";
  inputButton5.value = "삭제";
  inputButton5.onclick = function () {
    const pw = prompt("비밀번호");
    send({reqType: "delete", index: info.index, hash: sha256(pw)}, (res) => {
      if (res.msg === "success"){
        alert("삭제되었습니다.");
      } else {
        alert("error");
      }
    })
  };
  const inputButton6 = document.createElement("input");
  if(iterate!==2){
    inputButton6.className = "background-color-white";
    inputButton6.type = "button";
    inputButton6.value = "자세히";
    inputButton6.onclick = ()=>{
      location.href = "/comment/"+info.index;
    };
  }
  const div_valueButton = document.createElement("div");
  div_valueButton.appendChild(inputButton1);
  div_valueButton.appendChild(inputButton2);
  // div_valueButton.appendChild(inputButton3);
  div_valueButton.appendChild(inputButton4);
  div_valueButton.appendChild(inputButton5);
  if(iterate!==2)div_valueButton.appendChild(inputButton6);
  div_valueButton.appendChild(div_date);

  const div_content = document.createElement("div");
  div_content.style = "display:inline-block";
  const span_content1 = document.createElement("span");
  span_content1.id = "ip"+info.index;
  span_content1.style = "border:1px solid rgb(80, 80, 80);padding:0 5px;margin:0 5px;";
  span_content1.appendChild(document.createTextNode(info.writer));
  const span_content2 = document.createElement("span");
  span_content2.id = "content"+info.index;
  span_content2.appendChild(document.createTextNode(info.content));
  div_content.appendChild(span_content1);
  div_content.appendChild(span_content2);

  const div_innerComment = document.createElement("div");

  const div_comment = document.createElement("div");
  div_comment.style="border:1px solid gray;border-radius:25px;padding:25px;font-size:20px;margin-top:30px;";
  div_comment.appendChild(div_content);
  div_comment.appendChild(make_br());
  div_comment.appendChild(make_br());
  div_comment.appendChild(div_valueButton);
  div_comment.appendChild(div_innerComment);
  if(iterate > 0){
    for(let i=0; i<info.innerComment.length; i++){
      let callbackFn = function(res) {
        makeCard(res.comment,iterate-1,div_innerComment);
      };
      getCommentInfo(info.innerComment[i],callbackFn);
    }
    if(info.innerComment.length>1){
      div_innerComment.style = "height:500px;overflow:hidden;box-shadow:0 -40px 10px 0 #222 inset;";
      const spreadButton = getElm("#spreadButton")[0].cloneNode(true);
      spreadButton.style.display = "block";
      spreadButton.onclick = function(){
        div_innerComment.style.height = "auto";
        div_innerComment.style.boxShadow = "";
        spreadButton.style.display = "none";
      };
      div_innerComment.insertBefore(spreadButton, div_innerComment.firstChild);
    }
  }

  if(!!parentElement){
    parentElement.appendChild(div_comment);
    updateDate(+new Date(info.date),getElm("#date"+info.index)[0]);
  }
  if(iterate!==0)div_comment.appendChild(createInputToWrite(info.index));
  
  return [div_comment,()=>updateDate(+new Date(info.date),getElm("#date"+info.index)[0])];
}

function createInputToWrite(parentIndex){
  const inputToWriteComment = document.createElement("input");
  inputToWriteComment.className = "background-color-white";
  inputToWriteComment.placeholder = "댓글";
  inputToWriteComment.style = "width:1000px;border-width:0 0 1px 0;";
  inputToWriteComment.type="text";
  inputToWriteComment.id = "commentTo"+parentIndex;
  inputToWriteComment.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
      const hash = sha256(prompt("등록할 비밀번호")+"dafwcje");
      send({
        reqType: "postComment",
        content: inputToWriteComment.value,
        pw: hash,
        parentIndex
      }, (res) => {
        if(res.msg === "success"){
          location.reload();
        } else {
          alert(res.msg);
        };
      });
    }
  });
  const divIncludingITWC = document.createElement("div");
  divIncludingITWC.style = "border:1px solid gray;border-radius:25px;padding:25px;font-size:20px;margin-top:30px;";
  divIncludingITWC.name = "commentTo"+parentIndex;
  divIncludingITWC.appendChild(inputToWriteComment);
  return divIncludingITWC;
}

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

function getCommentInfo(index,callbackFn){
  send({reqType:"getComment",index:index},(res) => {
    if(res.msg==="success"){
      callbackFn(res);
    }
  });
}

if ((i=>i.length===3 && i[2].length > 0)(location.pathname.split("/"))){
  document.querySelector("#displayComment").removeChild(document.querySelector("#displayComment > div:nth-child(5)"));
  let callbackFn = function(res) {
    makeCard(res.comment,2,document.querySelector("#displayComment"));
  };
  getCommentInfo(location.pathname.split("/")[2]-0,callbackFn);
} else {
  location.href = "/comment/0";
}
