"use strict";

const express = require("express");
const router = express.Router();

const Logger = require(process.cwd() + "/modules/Logger");
const Collection = require(process.cwd() + "/modules/models/collections/Collection");

const templates = require(process.cwd() + "/templates/templates");
const page = templates(__dirname + "/page");
const globalLayout = require(process.cwd() + "/layouts/global");

router.get("/", (request, response) => {
    const session = request.session;
    if (!session.account) {
        response.redirect("/dumps");
        return;
    }
    response.send(globalLayout(request, page({}), {
        pageTitle: "Dump Creation",
        styles: ["/stylesheets/dumps/create/styles.css"],
        scripts: ["/javascripts/built/dumps/create/client-entry.js"]
    }));
});

/* POST creates a dump. */
router.post("/", (request, response) => {
    const session = request.session;
    // TODO check if the user has priveledge to create new dumps.
    if (!session.account) {
        response.status(403).json({
            message: "Request denied"
        });
        return;
    }

    const body = request.body;
    const title = body.title;
    const description = body.description;

    Collection.createCollection("dump", title).then((collection) => {

    });

    response.status(200).json({
        message: "Successfully created dump collection."
        // redirect: TO THE THING
    });
});

module.exports = router;