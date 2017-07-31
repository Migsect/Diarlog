"use strict";

const express = require("express");
const router = express.Router();

const Collection = require(process.cwd() + "/modules/models/collections/Collection");
const Logger = require(process.cwd() + "/modules/Logger");

const templates = require(process.cwd() + "/templates/templates");
const globalLayout = require(process.cwd() + "/layouts/global");

const contentPage = templates(__dirname + "/content");
const addPage = templates(__dirname + "/add");
const settingsPage = templates(__dirname + "/settings");
const permissionsPage = templates(__dirname + "/permissions");
const previewPage = templates(__dirname + "/preview");

router.get("/:dumpId", (request, response) => {
    const dumpId = request.params.dumpId;
    Collection.getCollectionByHashid(dumpId).then((collection) => {
        if (!collection) {
            response.redirect("/dumps");
            return;
        }
        response.send(globalLayout(request, previewPage({
            url: request.originalUrl
        }), {
            styles: "/stylesheets/dumps/dump.css",
            pageTitle: collection.title
        }));
    }).catch(error => {
        Logger.error("GET", request.originalUrl, error);
        response.status(500).json({
            message: "Internal Server Error"
        });
    });
});

/* Page to add more content to the dump */
router.get("/:dumpId/add", (request, response) => {
    response.send(globalLayout(request, addPage({}), {
        styles: "/stylesheets/dumps/dump.css"
    }));
});

router.get("/:dumpId/settings", (request, response) => {
    response.send(globalLayout(request, addPage({}), {
        styles: "/stylesheets/dumps/dump.css"
    }));
});

router.get("/:dumpId/permissions", (request, response) => {
    response.send(globalLayout(request, addPage({}), {
        styles: "/stylesheets/dumps/dump.css"
    }));
});

/* Page displaying the dump item (uses sockets) */
router.get("/:dumpId/content/:contentId", (request, response) => {
    const dumpId = request.params.dumpId;
    const contentId = request.params.contendId;
    response.send(globalLayout(request, addPage({}), {
        styles: "/stylesheets/dumps/dump.css"
    }));
});

module.exports = router;