"use strict";

const fs = require('fs');
// let n = JSON.parse(fs.readFileSync("./src/models/tmp.json","utf8")).map(x=>{
//   for (let i = x.length - 1; i > 0; i--) {
//     let j = Math.floor(Math.random() * (i + 1));
//     [x[i], x[j]] = [x[j], x[i]];
//   }
//   return x;
// });
// let m = fs.writeFileSync("./src/models/tmp.json",JSON.stringify(n));
const crypto = require('crypto');

function sha256_for_ip(value) {
  return crypto.createHmac('sha256', "잇츠 포 쉐이킹 더 아이피").update(value).digest('hex')
}

class Validator {

  canIndexNumber(x){
    if(Number.isInteger(x) && x >= 0)
      return true;
    else return false;
  }

  canEmail(x){
    return /[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(x);
  }

  canPhoneNumber(x){
    return /\d{3}-\d{3,4}-\d{4}$/.test(x);
  }

  canString(x){
    return typeof(x)==="string"
  }

  canStringInArr(x){
    return x.every(this.canString);
  }

  canObjecString(x){
    try{
      JSON.parse(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  hideIP(x){
    return (y=>(z => z.slice(0,2))(y.split(".")).join("."))(x);
  }

  getIPNickName(ip){
    const a = JSON.parse(fs.readFileSync("./src/models/tmp.json","utf8"));
    const hash = Array.from(sha256_for_ip(ip.split(".").slice(0,-1).join("."))).map(x=>Number.parseInt(x,16));
    const i = Object.keys(Array(7).fill(0)).map(x=>hash[x]*(2<<(16*x))).reduce((i,sum)=>i+sum,0);
    return a[2][i%200]+" "+a[1][(i>>8)%185]+" "+a[0][(i>>16)%142];
  }
  
  canID(x){
    return !/[^a-zA-Z0-9]/.test(x);
  }

  strLength(str,l,r){
    if (this.canString(str))
      return l <= str.length && str.length <= r;
    else return false;
  }

  blockXSS(str){
    return str.replace(/&/g,"&amp").replace(/>/g,"&gt").replace(/</g,"&lt").replace(/\"/g,"&quot").replace(/\'/g,"&#39").replace(/\n/g,"<br>").replace(/ /g,"&nbsp;");
  }

}

module.exports = Validator;