"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const authPage = templates(__dirname + "/pages/auth");
const globalLayout = require("./layouts/global");

/* GET home page. */
router.get("/", (request, response) => {
    response.send(globalLayout(request, authPage({
        pageTitle: "Sign In"
    }), {
        styles: ["/stylesheets/auth.css"],
        scripts: ["/javascipts/built/auth.js"],
        pageTitle: "Sign In"
    }));
});

module.exports = router;