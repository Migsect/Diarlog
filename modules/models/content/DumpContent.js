"use strict";

const Content = require("./Content");

class DumpContent extends Content {
    constructor(config) {
        super(config);
    }
}

Content.registerType("dump", DumpContent);
module.exports = DumpContent;