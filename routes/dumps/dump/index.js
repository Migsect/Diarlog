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
        response.send(globalLayout(request, listingPage({
            url: request.originalUrl,
            account: session.account
        }), {
            styles: ["/stylesheets/dumps/dump/listing/styles.css"],
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
        styles: ["/stylesheets/dumps/dump/add/styles.css"],
        scripts: ["/javascripts/built/dumps/dump/add/client-entry.js"]
    }));
});

router.get("/:dumpId/settings", (request, response) => {
    response.send(globalLayout(request, settingsPage({}), {
        styles: ["/stylesheets/dumps/dump/styles.css"]
    }));
});

router.get("/:dumpId/permissions", (request, response) => {
    response.send(globalLayout(request, permissionsPage({}), {
        styles: ["/stylesheets/dumps/permissions/styles.css"]
    }));
});

/* Page displaying the dump item (uses sockets) */
router.get("/:dumpId/content/:contentId", (request, response) => {
    const dumpId = request.params.dumpId;
    const contentId = request.params.contendId;
    response.send(globalLayout(request, contentPage({}), {
        styles: ["/stylesheets/dumps/content/styles.css"]
    }));
});

/* Adding content to the dump */
router.post("/:dumpId/add/content", upload.array("uploads"), (request, response) => {
    const dumpId = request.params.dumpId;
    const contentId = request.params.contendId;
    const account = request.session.account;
    if (!account) {
        response.status(401).json({
            message: "Unauthorized action"
        });
        return;
    }

    const uploadData = JSON.parse(request.body.uploadData);
    const files = request.files;
    console.log(uploadData, files);

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

        // console.log("title:", title, "filename:", filename, "description:", description);
        // console.log(upload);
        return Content.createContent("dump", title).then((content) => {
            /* Saving the content's file */
            content.setDescription(description);
            content.setUploadFileName(filename);
            return content.updateFile(buffer, fileType)
                .then(() => content.save());
        });
    });

    /* Returning successes or failures once everything saves.*/
    Promise.all(contentUploads).then((uploads) => {
        console.log(uploads);

        response.status(200).json({
            message: "success"
        });
    }).catch((error) => {
        Logger.error("/:dumpId/add/content", error);
        response.status(500).json({
            message: "Internal Server Error"
        });
    });

});

module.exports = router;