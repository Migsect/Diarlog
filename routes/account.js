"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const accountPage = templates(__dirname + "/pages/account");
const globalLayout = require("./layouts/global");

/* GET home page. */
router.get("/", (request, response) => {
    response.send(globalLayout(request, accountPage({
        pageTitle: "Account"
    }), {
        styles: ["/stylesheets/auth.css"],
        scripts: ["/javascipts/built/auth.js"],
        pageTitle: "Account"
    }));
});

module.exports = router;