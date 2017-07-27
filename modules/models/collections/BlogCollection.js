"use strict";

const Collection = require("./Collection");

class BlogCollection extends Collection {
    constructor(config) {
        super(config);
    }
}
Collection.registerType("blog", BlogCollection);
module.exports = BlogCollection;