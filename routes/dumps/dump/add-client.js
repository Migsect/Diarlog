"use strict";

const $ = document.querySelector.bind(document);
const Utils = require("WebUtils");

const addUploadItemTemplate = require("./addUploadItem.hbs");

const uploadListing = $(".upload-listing");
const uploadInput = $("#upload-input");
const uploadButton = $("#upload-input-button");

uploadButton.addEventListener("click", () => {
    uploadInput.click();
});

uploadInput.addEventListener("change", (event) => {
    const target = event.target;
    const files = target.files;

    for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const uploadElement = Utils.htmlToElement(addUploadItemTemplate({
            filename: file.name
        }));
        uploadListing.appendChild(uploadElement);
        const fileReader = new FileReader();
        fileReader.onload = () => {

        };

    }

});