"use strict";

const express = require("express");
const router = express.Router();

const Collection = require(process.cwd() + "/modules/models/collections/Collection");
const Logger = require(process.cwd() + "/modules/Logger");

const templates = require(process.cwd() + "/templates/templates");
const page = templates(__dirname + "/page");
const globalLayout = require(process.cwd() + "/layouts/global");

router.get("/:id", (request, response) => {
    response.send(globalLayout(request, page({}), {
        styles: "/stylesheets/dumps/dump.css"
    }));
});

module.exports = router;