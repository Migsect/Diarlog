"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const indexPage = templates(__dirname + "/pages/index");
const globalLayout = require("./layouts/global");

/* GET home page. */
router.get("/", function(request, response) {
    response.send(globalLayout(request, indexPage({}), {
        styles: "/stylesheets/index.css"
    }));
});

module.exports = router;