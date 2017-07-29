"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const page = templates(__dirname + "/page");
const globalLayout = require(process.cwd() + "/layouts/global");

/* GET home page. */
router.get("/", function(request, response) {
    response.send(globalLayout(request, page({}), {
        styles: "/stylesheets/index.css"
    }));
});

module.exports = router;