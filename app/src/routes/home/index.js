"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl")

router.get("/",ctrl.output.main);
router.get("/main",(req,res)=>{res.redirect("/")})
router.get("/login",ctrl.output.login);
router.post("/",ctrl.process.main);

module.exports = router;