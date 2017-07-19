"use strict";

const Knex = require("knex");

const config = require("./config/general").database;

let instance = null;
class DatabaseManager {

    static initialize(config) {
        if (instance !== null) {
            throw new Error("Attempted to initialize DatabaseManager twice.");
        }
        const connection = Knex(config);
        const databaseManager = new DatabaseManager(connection);
        Object.defineProperty(module.exports, "instance", {
            configurable: false,
            writable: false,
            value: databaseManager
        });
        return databaseManager;
    }

    static get instance() {
        DatabaseManager.initialize(config);
        return instance;
    }

    constructor(connection) {
        const self = this;
        Object.defineProperties(self, {
            connection: {
                value: connection
            }
        });
    }
}

module.exports = DatabaseManager;