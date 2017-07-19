"use strict";

const DatabaseManager = require("../database/DatabaseManager");

const ACCOUNT_TABLE_NAME = "accounts";

class Account {
    static get table() {
        return ACCOUNT_TABLE_NAME;
    }
    static initializeDatabase() {
        const connection = DatabaseManager.instance.connection;
        return connection.schema.createTableIfNotExists(ACCOUNT_TABLE_NAME, function(table) {
            table.increments("dbid").primary().notNullable();
        }).then(() => {
            return connection.table(ACCOUNT_TABLE_NAME, function(table) {
                table.uuid("uuid").notNullable();
                table.string("username").notNullable();
                table.string("email").notNullable();
                table.string("password").notNullable();
            });
        });
    }
}

module.exports = Account;