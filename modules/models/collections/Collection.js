"use strict";

const Uuid = require("uuid/v4");

const DatabaseManager = require(process.cwd() + "/modules/database/DatabaseManager");
const Logger = require(process.cwd() + "/modules/Logger");

const COLLECTION_TABLE_NAME = "collection";
const types = new Map();

class Collection {

    /**
     * The table name for the collections.
     * 
     * @return {String} The name of the table for collections.
     */
    static get table() {
        return COLLECTION_TABLE_NAME;
    }

    /**
     * Initializes the database for collections.
     * Returns a promise that will resolve when the table for the collections is created.
     * Throws errors go to catch for the promise.
     * @return {Promise} Promise to resolve when the table is created
     */
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

    /**
     * Registers a constructor to be used for the type of collection.
     * Whenever a new collection is retrieved from the database or is created, this type
     * will be it's first class with a parent being the collection class.
     *
     * Throws an error if type has already been registered for by another sub-class.
     * 
     * @param  {String} type The type to register the constructor as.
     * @param  {Functiion} constructor The constructor to register for the type.
     */
    static registerType(type, constructor) {
        if (types.has(type)) {
            throw new Error("Collection type '" + type + "' already exsists. Cannot register '" + constructor.name + "'.");
        }
        types.set(type, constructor);
    }

    /**
     * Creates a new collection with the specified type and name.
     * If the type is not a valid type, then an error will be thrown and can be caught from the
     * promise.  This returns the newly created collection when the promise resolves.
     * 
     * @param  {String} type The type of the collection to create.
     * @param  {String} name The name of the collection to create.
     * @return {Promise}      The promise to provide the newly created collection.
     */
    static createCollection(type, name) {
        const connection = DatabaseManager.instance.connection;
        const uuid = Uuid();
        if (!types.has(type)) {
            return Promise.reject(new Error("Invalid Type:", type));
        }
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
            const constructor = types.get(type.toLowerCase());
            if (!constructor) {
                throw new Error("Invalid Type:", type);
            }
            const account = new constructor({
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

    /**
     * Gets all the collections that match the query.  If no promises exist that match the
     * query then an empty list is returned.
     *
     * If any of the return items fail to match to a type, an error is thrown.
     * 
     * @param  {Object} query The query to search for
     * @return {Promise} A promise to return all the matching collections.
     */
    static getCollections(query) {
        const connection = DatabaseManager.instance.connection;
        return connection(COLLECTION_TABLE_NAME)
            .select()
            .where(query)
            .then(results => results.map(result => {
                const constructor = types.get(result.type);
                if (!constructor) {
                    throw new Error("Invalid Type:", result.type, result);
                }
                return new constructor(result);
            }));
    }

    static getCollectionsByType(type) {
        return Collection.getCollections({
            type: type
        });
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

        this.contents = JSON.parse(config.contents);

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
                contents: JSON.stringify([]),
                permissions: JSON.stringify(this.permissions),
                settings: JSON.stringify(this.settings),
                data: JSON.stringify(this.data)
            });
    }
}

module.exports = Collection;