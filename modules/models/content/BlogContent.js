"use strict";

const Content = require("./Content");

class BlogContent extends Content {
    constructor(config) {
        super(config);
    }
}

Content.registerType("blog", BlogContent);
module.exports = BlogContent;