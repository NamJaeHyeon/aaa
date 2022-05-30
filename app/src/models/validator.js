"use strict";

const fs = require('fs');

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

  date(){
    return (x => x.get)(new Date());
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
    return str.replace(/&/g,"&amp").replace(/>/g,"&gt").replace(/</g,"&lt").replace(/\"/g,"&quot").replace(/\'/g,"&#39");
  }

}

module.exports = Validator;