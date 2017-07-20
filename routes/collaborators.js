"use strict";

const express = require("express");
const router = express.Router();

const templates = require(process.cwd() + "/templates/templates");
const collaboratorsPage = templates(__dirname + "/pages/collaborators");
const globalLayout = require("./layouts/global");

router.get("/", (request, response) => {
    response.send(globalLayout(request, collaboratorsPage({}), {
        styles: "/stylesheets/collaborators.css"
    }));
});

module.exports = router;