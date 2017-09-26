"use strict";

const path = require("path");
const fs = require("fs-extra");
const sharp = require("sharp");

const Content = require("./Content");

const dumpContentDirectory = path.join(Content.directory, "dump");
const thumbnailFileName = "thumbnail.png";

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
            this.data.fileLocation = path.join(this.saveDirectory, this.contentFile);
            return fs.ensureDir(this.saveDirectory)
                .then(() => fs.writeFile(this.data.fileLocation, bytes))
                .then(() => {
                    return sharp(this.data.fileLocation)
                        .resize(200, 200)
                        .toFile(this.thumbnailFile);
                });
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

    /** Returns the save directory for the content */
    get saveDirectory() {
        return path.join(dumpContentDirectory, this.uuid);
    }
    /** Returns the path to the thumbnail file */
    get thumbnailFile() {
        return path.join(this.saveDirectory, thumbnailFileName);
    }
    /** Returns the name of the content file. */
    get contentFile() {
        return "content" + (this.data.fileType ? ("." + this.data.fileType) : "");
    }
    /** Returns the URL of the thumbnail */
    get thumbnailURL() {
        return "/dumps/content/" + this.uuid + "/" + thumbnailFileName;
    }
    /** Returns the URL of the content */
    get contentURL() {
        return "/dumps/content/" + this.uuid + "/" + this.saveName;
    }
    /** Returns the URL of the content page, requires a dump collection */
    pageURL(collection) {
        return "/dumps/" + collection.hashid + "/" + this.hashid;
    }

    /**
     * Returns the fileName of the content.
     * This is the uuid of the content plus the file extension.
     * 
     * @return {String} The fileName of the content
     */
    get saveName() {
        return "content" + (this.data.fileType ? ("." + this.data.fileType) : "");
    }
}

Content.registerType("dump", DumpContent);
module.exports = DumpContent;