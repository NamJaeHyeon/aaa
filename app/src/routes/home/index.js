"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl")

router.get("/",ctrl.output.main);
router.get("/main",(req,res)=>{res.redirect("/")})
router.get("/login",ctrl.output.login);
router.get("/makeChannel",ctrl.output.makeChannel);
router.get("/c/:pathID",ctrl.output.watchChannelMain);
router.get("/write",ctrl.output.writeForm);
router.get("/c/:pathID/:index",ctrl.output.watchArticle);
router.post("/",ctrl.process.main);
router.post("/makeChannel",ctrl.process.requestToMakeChannel);
router.post("/write",ctrl.process.writeArticle);

module.exports = router;