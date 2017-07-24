"use strict";

const express = require("express");
const router = express.Router();

const Collection = require(process.cwd() + "/modules/models/collections/Collection");
const Logger = require(process.cwd() + "/modules/Logger");

const templates = require(process.cwd() + "/templates/templates");
const dumpPage = templates(__dirname + "/pages/dumps/dump");
const dumpListingPage = templates(__dirname + "/pages/dumps/dumpListing");
const dumpCreatePage = templates(__dirname + "/pages/dumps/dumpCreate");
const globalLayout = require("./layouts/global");

/* GET home page. */
router.get("/", (request, response) => {
    const session = request.session;
    Collection.getCollectionsByType("dump").then((collections) => {
        response.send(globalLayout(request, dumpListingPage({
            dumps: [ // TEMP PH ITEMS for testing
                { name: "Dump 1", owner: "User 1", id: "abcdefgh" },
                { name: "Dump 2", owner: "User 2", id: "abcdefgh" },
                { name: "Dump 3", owner: "User 3", id: "abcdefgh" },
                { name: "Dump 4", owner: "User 4", id: "abcdefgh" },
                { name: "Dump 5", owner: "User 5", id: "abcdefgh" },
                { name: "Dump 6", owner: "User 6", id: "abcdefgh" },
                { name: "Dump 7", owner: "User 7", id: "abcdefgh" },
                { name: "Dump 8", owner: "User 8", id: "abcdefgh" }
            ],
            canCreate: session.account
        }), {
            pageTitle: "Dumps",
            styles: ["/stylesheets/dumps/dumpListing.css"]
        }));
    }).catch((error) => {
        Logger.error("GET dumps", error);
        response.send(500).json({
            message: "Internal Server Error"
        });
    });
});

router.get("/create", (request, response) => {
    const session = request.session;
    if (!session.account) {
        response.redirect("/dumps");
        return;
    }
    response.send(globalLayout(request, dumpCreatePage({}), {
        pageTitle: "Dump Creation",
        styles: ["/stylesheets/dumps/dumpCreate.css"],
        scripts: ["/javascripts/built/dumpCreate-entry.js"]
    }));
});

router.post("/create", (request, response) => {
    const session = request.session;
    // TODO check if the user has priledge to create new dumps.
    if (!session.account) {
        response.status(403).json({
            message: "Request denied"
        });
        return;
    }
    response.status(200).json({
        message: "Successfully created dump collection."
        // redirect: TO THE THING
    })
});

router.get("/:id", (request, response) => {
    response.send(globalLayout(request, dumpPage({}), {
        styles: "/stylesheets/dumps/dump.css"
    }));
});

module.exports = router;