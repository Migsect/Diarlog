"use strict";

const express = require("express");
const router = express.Router();
const path = require("path");

const DumpContent = require(process.cwd() + "/modules/models/content/DumpContent");

router.get("/:uuid/:file", (request, response) => {
    const uuid = request.params.uuid;
    const fileName = request.params.file;
    response.sendFile(fileName, {
        lastModified: false,
        root: path.join(DumpContent.directory, uuid)
    }, (err) => {
        if (err) {
            response.status(500).json({
                message: "Internal Server Error"
            });
            return;
        }

    });
});

module.exports = router;