function printLiveChat(){
  let t = "";
  let comments = JSON.parse(fs.readFileSync("./data/comments/comments.json","utf8"));
  for(let i=comments.count-1; i>=comments.count-15;i--) t+=`
            <div>
              <span style="font-size:15px;float:left;width:70px">${JSON.parse(fs.readFileSync("./data/comments/"+i+"/data.json","utf8")).nickName}</span>
              <span style="font-size:15px;float:right;width:650px;overflow:hidden;text-overflow:ellipsis;">${fs.readFileSync("./data/comments/"+i+"/text","utf8").replace(/\>/g,"&gt").replace(/\</g,"&lt").replace(/\"/g,"&quot").replace(/\'/g,"&#39")}</span>
            </div>`;
  return t;
}