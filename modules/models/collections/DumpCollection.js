"use strict";

const Collection = require("./Collection");

class DumpCollection extends Collection {
    constructor(config) {
        super(config);
    }
}

Collection.registerType("dump", DumpCollection);
module.exports = DumpCollection;