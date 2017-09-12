"use strict";

const path = require("path");
const fs = require("fs-extra");

const Content = require("./Content");

const dumpContentDirectory = path.join(Content.directory, "dump");

class DumpContent extends Content {

    static get directory() {
        return dumpContentDirectory;
    }

    constructor(config) {
        super(config);
    }

    /**
     * Sets the description of the dump content.
     * 
     * @param {String} description The description of the conten 
     */
    setDescription(description) {
        this.data.description = description || "";
    }

    /**
     * Sets the fileName of the dump content. Note that this is the name that
     * the file will be saved as, but rather the name of the file that was
     * uploaded when the content was being created.
     * 
     * @param {String} fileName The fileName to store within the content's data.
     */
    setUploadFileName(fileName) {
        this.data.fileName = fileName;
    }

    /**
     * Updates the file saved on the server.
     * This will delete or overwrite the current file for the content.
     * 
     * @param  {Bytes} bytes     The bytes that will be saved to the file system
     * @param  {String} fileType The type of the file that is being saved (file ending)
     * @return {Promise}         A promise to return once the file has been saved.
     */
    updateFile(bytes, fileType) {
        /* Deleting the old file first before writing the new one */
        return this.deleteFile().then(() => {
            this.data.fileType = fileType;
            this.data.fileLocation = path.join(dumpContentDirectory, this.saveName);
            return fs.ensureDir(dumpContentDirectory)
                .then(() => fs.writeFile(this.data.fileLocation, bytes));
        });
    }

    /**
     * Deletes the file saved on the server.
     * This means the content will reference no file in the end.
     * 
     * @return {Promise} Promise to resolve to a boolean of whether or not a file is deleted.
     */
    deleteFile() {
        if (this.data.fileLocation) {
            return fs.unlink(this.data.fileLocation).then(() => {
                this.data.fileLocation = null;
                return true;
            });
        } else {
            return Promise.resolve(false);
        }
    }

    /**
     * Returns the fileName of the content.
     * This is the uuid of the content plus the file extension.
     * 
     * @return {String} The fileName of the content
     */
    get saveName() {
        return this.uuid + (this.data.fileType ? ("." + this.data.fileType) : "");
    }
}

Content.registerType("dump", DumpContent);
module.exports = DumpContent;