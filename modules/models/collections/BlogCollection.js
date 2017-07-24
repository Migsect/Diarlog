"use strict";

const Collection = require("./Collection");

class BlogCollection extends Collection {
    constructor(config) {
        super(config);
    }
}

module.exports = BlogCollection;