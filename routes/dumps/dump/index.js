"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const Collection = require(process.cwd() + "/modules/models/collections/Collection");
const Content = require(process.cwd() + "/modules/models/content/Content");
const Logger = require(process.cwd() + "/modules/Logger");

const templates = require(process.cwd() + "/templates/templates");
const globalLayout = require(process.cwd() + "/layouts/global");

const contentPage = templates(__dirname + "/content/page");
const addPage = templates(__dirname + "/add/page");
const settingsPage = templates(__dirname + "/settings/page");
const permissionsPage = templates(__dirname + "/permissions/page");
const listingPage = templates(__dirname + "/listing/page");

/* Handling the rendering of the page */
router.get("/:dumpId", (request, response) => {
    const session = request.session;
    const dumpId = request.params.dumpId;
    Collection.getCollectionByHashid(dumpId).then((collection) => {
        if (!collection) {
            response.redirect("/dumps");
            return;
        }
        return collection.getContents()
            .then((contents) => {

                response.send(globalLayout(request, listingPage({
                    url: request.originalUrl,
                    account: session.account,
                    contents: contents.map((content) => ({
                        title: content.title,
                        thumbnail: content.thumbnailURL,
                        page: content.pageURL(collection)
                    }))
                }), {
                    styles: ["/stylesheets/dumps/dump/listing/styles.css"],
                    pageTitle: collection.title,
                }));
            });

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
        styles: ["/stylesheets/dumps/dump/add/styles.css"],
        scripts: ["/javascripts/built/dumps/dump/add/client-entry.js"]
    }));
});

/* Page for editing the settings */
router.get("/:dumpId/settings", (request, response) => {
    response.send(globalLayout(request, settingsPage({}), {
        styles: ["/stylesheets/dumps/dump/styles.css"]
    }));
});

/* Page for editing the permissions */
router.get("/:dumpId/permissions", (request, response) => {
    response.send(globalLayout(request, permissionsPage({}), {
        styles: ["/stylesheets/dumps/permissions/styles.css"]
    }));
});

/* Page displaying the dump item (uses sockets in the future?) */
router.get("/:dumpId/:contentId", (request, response) => {
    const dumpId = request.params.dumpId;
    const contentId = request.params.contentId;
    Promise.all([
            Collection.getCollectionByHashid(dumpId),
            Content.getContentByHashid(contentId)
        ])
        .then((results) => {
            const collection = results[0];
            const content = results[1];
            response.send(globalLayout(request, contentPage({
                contentURL: content.contentURL,
                contentDescription: content.data.description
            }), {
                styles: ["/stylesheets/dumps/dump/content/styles.css"],
                pageTitle: collection.title,
                pageSubtitle: content.title
            }));
        })
        .catch((error) => {
            Logger.error("GET", request.originalUrl, error);
            response.status(500).json({
                message: "Internal Server Error"
            });
        });
});

/* Adding content to the dump */
router.post("/:dumpId/add/content", upload.array("uploads"), (request, response) => {
    const dumpId = request.params.dumpId;
    const account = request.session.account;
    if (!account) {
        response.status(401).json({
            message: "Unauthorized action"
        });
        return;
    }

    const uploadData = JSON.parse(request.body.uploadData);
    const files = request.files;

    Collection.getCollectionByHashid(dumpId)
        .then((collection) => {
            /* If we can't find the collection, then naughty stuff is happening */
            if (!collection) {
                Logger.error("/:dumpId/add/content", "No Collection Found:", dumpId);
                response.status(400).json({
                    message: "Invalid Request"
                });
                return;
            }

            /* Creating all the content items that are uploaded, adding them to the database */
            const contentUploads = uploadData.map((upload, index) => {
                const file = files[index];
                const mimetype = file.mimetype;
                /* mimetype has a higher class, so getting the actual extension */
                const fileType = mimetype.split("/")[1];
                const buffer = file.buffer;

                const title = upload.title;
                const filename = upload.filename;
                const description = upload.description;

                return Content.createContent("dump", title)
                    .then((content) => {
                        /* Saving the content's file */
                        content.setDescription(description);
                        content.setUploadFileName(filename);
                        return content.updateFile(buffer, fileType)
                            .then(() => content.save())
                            .then(() => content);

                    });
            });
            return Promise.all(contentUploads)
                .then((uploads) => {
                    uploads.forEach((upload) => collection.addContent(upload));
                    return collection.save();
                })
                .then(() => {
                    response.status(200).json({
                        message: "success"
                    });
                })
                .catch((error) => {
                    Logger.error("/:dumpId/add/content", error);
                    response.status(500).json({
                        message: "Internal Server Error"
                    });
                });
        }).catch(error => {
            Logger.error("GET", request.originalUrl, error);
            response.status(500).json({
                message: "Internal Server Error"
            });
        });
});

module.exports = router;