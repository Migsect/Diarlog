"use strict";

const $ = document.querySelector.bind(document);
const Utils = require("WebUtils");

const addUploadItemTemplate = require("./uploadItem.hbs");

const uploadInput = $("#upload-input");
const uploadButton = $("#upload-input-button");
const finalizeButton = $("#finalize-button");

uploadButton.addEventListener("click", () => {
    uploadInput.click();
});

const uploadListing = $(".upload-listing");
const uploadList = [];
class Upload {

    constructor(file) {
        this.file = file;
        this.basename = file.name.replace(/\.[^/.]+$/, "");
        console.log(file);
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            const result = event.target.result;
            /* After the file is loaded, add the item */
            this.element = Utils.htmlToElement(addUploadItemTemplate({
                filename: file.name,
                basename: this.basename,
                isImage: file.type.startsWith("image"),
                source: result
            }));
            uploadListing.appendChild(this.element);
            this.addElementListeners();
        };
        fileReader.readAsDataURL(file);

        uploadList.push(this);
    }

    remove() {
        const index = uploadList.indexOf(this);
        this.element.parentElement.removeChild(this.element);
        uploadList.splice(index, 1);
    }

    moveUp() {
        const upperSibling = this.element.previousSibling;
        const index = uploadList.indexOf(this);
        if (index <= 0 && upperSibling) {
            return false;
        }
        this.element.parentElement.insertBefore(this.element, upperSibling);
        uploadList.splice(index, 1);
        uploadList.splice(index - 1, 0, this);
        return true;
    }
    moveDown() {
        const lowerSibling = this.element.nextSibling;
        const index = uploadList.indexOf(this);
        if (index > uploadList.length - 1 && lowerSibling && lowerSibling.nextSibling) {
            return false;
        }
        this.element.parentElement.insertBefore(this.element, lowerSibling.nextSibling);
        uploadList.splice(index, 1);
        uploadList.splice(index + 1, 0, this);
        return true;
    }

    addElementListeners() {
        this.element.querySelector(".upload-controls-item-remove").addEventListener("click", () => {
            this.remove();
            if (uploadList.length <= 0) {
                finalizeButton.disabled = true;
            }
        });
        this.element.querySelector(".upload-controls-item-moveup").addEventListener("click", () => {
            this.moveUp();
        });
        this.element.querySelector(".upload-controls-item-movedown").addEventListener("click", () => {
            this.moveDown();
        });
    }
}

function onUpload(files) {
    for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        new Upload(file);
    }
}

uploadInput.addEventListener("change", (event) => {
    const target = event.target;
    const files = target.files;
    onUpload(files);
    if (files.length > 0) {
        finalizeButton.disabled = false;
    }
    target.value = null;

});

finalizeButton.addEventListener("click", (event) => {
    const formData = new FormData();

    const uploadData = uploadList.map((upload, index) => {
        const titleElement = upload.element.querySelector(".upload-naming-title");
        const filenameElement = upload.element.querySelector(".upload-naming-filename");
        const descriptionElement = upload.element.querySelector(".upload-description-textarea");

        formData.append("uploads", upload.file);
        return {
            title: titleElement.value,
            filename: filenameElement.value,
            description: descriptionElement.value,
            fileIndex: index
        };
    });

    formData.append("uploadData", JSON.stringify(uploadData));

    Utils.sendFormData("./add/content", formData).then((result) => {
        console.log("result:", result);
    }).catch((error) => {
        console.log("error:", error);
    });

});