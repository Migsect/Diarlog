"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const page = templates(__dirname + "/page");
const globalLayout = require(process.cwd() + "/layouts/global");

router.get("/", (request, response) => {
    response.send(globalLayout(request, collaboratorsPage({}), {
        styles: "/stylesheets/collaborators/styles.css"
    }));
});

module.exports = router;