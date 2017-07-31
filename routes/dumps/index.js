"use strict";

const express = require("express");
const router = express.Router();

const Collection = require(process.cwd() + "/modules/models/collections/Collection");
const Logger = require(process.cwd() + "/modules/Logger");

const templates = require(process.cwd() + "/templates/templates");
const page = templates(__dirname + "/page");
const globalLayout = require(process.cwd() + "/layouts/global");

router.use("/create", require("./create"));
router.use("/", require("./dump"));

/* GET home page. */
router.get("/", (request, response) => {
    const session = request.session;
    Collection.getCollectionsByType("dump").then((collections) => {
        console.log("collections", collections);
        response.send(globalLayout(request, page({
            dumps: collections.map((collection) => {
                return {
                    id: collection.hashid,
                    title: collection.title,
                    count: collection.contents.length,
                };
            }),
            canCreate: session.account
        }), {
            pageTitle: "Dumps",
            styles: ["/stylesheets/dumps/styles.css"]
        }));
    }).catch((error) => {
        Logger.error("GET dumps", error);
        response.send(500).json({
            message: "Internal Server Error"
        });
    });
});

module.exports = router;