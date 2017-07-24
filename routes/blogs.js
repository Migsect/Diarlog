"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const blogPage = templates(__dirname + "/pages/blogs/blog");
const blogListingPage = templates(__dirname + "/pages/blogs/blogListing");
const globalLayout = require("./layouts/global");

/* GET home page. */
router.get("/", function(request, response) {
    response.send(globalLayout(request, blogListingPage({}), {
        styles: "/stylesheets/index.css"
    }));
});

module.exports = router;