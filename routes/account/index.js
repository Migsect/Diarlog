"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const page = templates(__dirname + "/page");
const globalLayout = require(process.cwd() + "/layouts/global");

/* GET home page. */
router.get("/", (request, response) => {
    response.send(globalLayout(request, page({
        pageTitle: "Account"
    }), {
        styles: ["/stylesheets/account/styles.css"],
        scripts: [],
        pageTitle: "Account"
    }));
});

module.exports = router;