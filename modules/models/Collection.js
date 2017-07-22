"use strict";

const Uuid = require("uuid/v4");

const DatabaseManager = require("../database/DatabaseManager");
const Logger = require(process.cwd() + "/modules/Logger");

const COLLECTION_TABLE_NAME = "collection";

class Collection {
    static get table() {
        return COLLECTION_TABLE_NAME;
    }

    static initializeDatabase() {
        const connection = DatabaseManager.instance.connection;
        return connection.schema.createTableIfNotExists(COLLECTION_TABLE_NAME, function(table) {
            table.increments("dbid").primary().notNullable();
            table.uuid("uuid").notNullable();
            table.string("type").notNullable();
            table.string("name").notNullable();
            table.json("permissions").notNullable();
            table.json("settings").notNullable();
            table.json("meta").notNullable();
            table.json("data").notNullable();
        }).catch(error => {
            Logger.error(COLLECTION_TABLE_NAME, error);
            throw error;
        });
    }

    static createCollection(type, name) {
        const connection = DatabaseManager.instance.connection;
        const uuid = Uuid();

        return connection(COLLECTION_TABLE_NAME).insert({
            uuid: uuid,
            type: type,
            name: name,
            contents: JSON.stringify([]),
            permissions: JSON.stringify({}),
            settings: JSON.stringify({}),
            meta: JSON.stringify({}),
            data: JSON.stringify({})
        }).then(dbid => {
            const account = new Collection({
                dbid: dbid,
                uuid: uuid,
                type: type,
                name: name,
                contents: [],
                permissions: {},
                settings: {},
                meta: {},
                data: {}
            });
            return account;
        });
    }

    static getCollections(query) {
        const connection = DatabaseManager.instance.connection;
        return connection(COLLECTION_TABLE_NAME)
            .select()
            .where(query)
            .then(results => results.map(result => new Collection(result)));
    }

    static getCollection(query) {
        return Collection.getCollections(query)
            .then(collections => collections.length > 0 ? collections[0] : null);
    }

    static getCollectionByUUID(id) {
        return Collection.getCollection({ uuid: id });
    }
    static getCollectionByName(name) {
        return Collection.getCollection({ name: name });
    }

    constructor(config) {
        this.dbid = config.dbid;
        this.uuid = config.uuid;
        this.type = config.type;

        this.name = config.name;

        this.contents = config.contents;

        this.permissions = JSON.parse(config.permissions);
        this.settings = JSON.parse(config.settings);
        this.meta = JSON.parse(config.meta);
        this.data = JSON.parse(config.data);
    }

    /**
     * Saves the Collection to the database. (complete override of this state to the database)
     * 
     * @return {Promise} Promise that resolves when the saving is complete.
     */
    save() {
        const connection = DatabaseManager.instance.connection;
        return connection(COLLECTION_TABLE_NAME)
            .where("dbid", this.dbid)
            .update({
                name: this.name,
                permissions: JSON.stringify(this.permissions),
                settings: JSON.stringify(this.settings),
                data: JSON.stringify(this.data)
            });
    }
}

module.exports = Collection;