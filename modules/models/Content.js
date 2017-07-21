"use strict";

const Uuid = require("uuid/v4");

const DatabaseManager = require("../database/DatabaseManager");
const Logger = require(process.cwd() + "/modules/Logger");

const CONTENT_TABLE_NAME = "account";

class Content {

    static get table() {
        return CONTENT_TABLE_NAME;
    }

    static initializeDatabase() {
        const connection = DatabaseManager.instance.connection;
        return connection.schema.createTableIfNotExists(CONTENT_TABLE_NAME, function(table) {
            table.increments("dbid").primary().notNullable();
        }).then(() => {
            return connection.table(CONTENT_TABLE_NAME, function(table) {
                table.uuid("uuid").notNullable();
                table.string("type").notNullable();
                table.string("title").notNullable();
                table.json("meta").notNullable();
                table.json("data").notNullable();
            });
        });
    }

    static createContent(type, title) {
        const connection = DatabaseManager.instance.connection;
        const uuid = Uuid();

        return connection(CONTENT_TABLE_NAME).insert({
            uuid: uuid,
            type: type,
            title: title,
            meta: JSON.stringify({}),
            data: JSON.stringify({})
        }).then(dbid => {
            const account = new Content({
                dbid: dbid,
                uuid: uuid,
                type: type,
                title: title,
                meta: {},
                data: {}
            });
            return account;
        });
    }

    static getContents(query) {
        const connection = DatabaseManager.instance.connection;
        return connection(CONTENT_TABLE_NAME)
            .select()
            .where(query)
            .then(results => results.map(result => new Content(result)));
    }

    static getContent(query) {
        return Content.getCollections(query)
            .then(contents => contents.length > 0 ? contents[0] : null);
    }

    constructor(config) {
        this.dbid = config.dbid;
        this.uuid = config.uuid;
        this.type = config.type;

        this.title = config.title;

        this.meta = JSON.parse(config.meta);
        this.data = JSON.parse(config.data);
    }

}

module.exports = Content;