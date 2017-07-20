"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const dumpPage = templates(__dirname + "/pages/dump");
const dumpListingPage = templates(__dirname + "/pages/dumpListing");
const globalLayout = require("./layouts/global");

/* GET home page. */
router.get("/", function(request, response) {
    response.send(globalLayout(request, dumpListingPage({}), {
        styles: "/stylesheets/index.css"
    }));
});

module.exports = router;