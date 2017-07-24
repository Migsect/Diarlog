"use strict";

const Collection = require("./Collection");

class DumpCollection extends Collection {
    constructor(config) {
        super(config);
    }
}

module.exports = DumpCollection;