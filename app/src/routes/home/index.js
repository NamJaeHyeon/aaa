"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/",ctrl.log,ctrl.output.main);
router.get("/main",ctrl.log,(req,res)=>{res.redirect("/")})
router.get("/login",ctrl.log,ctrl.output.login);
router.get("/makeChannel",ctrl.log,ctrl.output.makeChannel);
router.get("/channel/:pathID",ctrl.log,ctrl.output.watchArticleList);
router.get("/write",ctrl.log,ctrl.output.writeForm);
router.get("/channel/:pathID/:index",ctrl.log,ctrl.output.watchArticle);
router.get("/channel/:pathID/:index/edit",ctrl.log,ctrl.output.editArticle);
router.get("/coding",ctrl.log,ctrl.output.coding);
router.get("/comment",ctrl.log,ctrl.output.comment);
router.get("/comment/:index",ctrl.log,ctrl.output.comment);
router.post("/",ctrl.process.main);
router.post("/makeChannel",ctrl.log,ctrl.process.requestToMakeChannel);
router.post("/write",ctrl.log,ctrl.process.writeArticle);
router.post("/channel/:pathID/:index",ctrl.log,ctrl.process.articleUpdate);
router.post("/channel/:pathID/:index/edit",ctrl.log,ctrl.process.articleEdit);
router.post("/comment",ctrl.log,ctrl.process.comment);
router.post("/comment/:index",ctrl.log,ctrl.process.comment);

module.exports = router;