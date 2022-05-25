"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const helmet = require('helmet');

const home = require("./src/routes/home");

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use(express.static(`${__dirname}/src/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use("/",home);

module.exports = app;