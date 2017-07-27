"use strict";

const Knex = require("knex");

const config = require(process.cwd() + "/config").database;

let instance = null;
class DatabaseManager {

    static initialize(config) {
        if (instance !== null) {
            throw new Error("Attempted to initialize DatabaseManager twice.");
        }
        const connection = Knex(config);
        const databaseManager = new DatabaseManager(connection);
        instance = databaseManager;
        return databaseManager;
    }

    static get instance() {
        if (!instance) {
            DatabaseManager.initialize(config);
        }
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