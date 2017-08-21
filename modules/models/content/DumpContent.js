"use strict";

const path = require("path");

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
     * Updates the file saved on the server.
     * This will delete or overwrite the current file for the content.
     * 
     * @param  {[type]} bytes    [description]
     * @param  {[type]} fileType [description]
     * @return {[type]}          [description]
     */
    updateFile(bytes, fileType) {
        this.data.fileType = fileType;

    }

    /**
     * Deletes the file saved on the server.
     * This means the content will reference no file in the end.
     */
    deleteFile() {

    }

    /**
     * Returns the filename of the content.
     * This is the uuid of the content plus the file extension.
     * 
     * @return {[type]} [description]
     */
    get fileName() {
        return this.uuid + (this.data.filetype ? ("." + this.data.fileType) : "");
    }
}

Content.registerType("dump", DumpContent);
module.exports = DumpContent;