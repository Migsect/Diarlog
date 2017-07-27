"use strict";

const path = require("path");
const Uuid = require("uuid/v4");

const DatabaseManager = require(process.cwd() + "/modules/database/DatabaseManager");
const Content = require(process.cwd() + "/modules/models/content/Content");
const Logger = require(process.cwd() + "/modules/Logger");

const config = require(process.cwd() + "/config");
const collectionsDirectory = path.join((config.data && config.data.saveDirectory) || "./data", "collections");

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
            table.string("title").notNullable();
            table.json("permissions").notNullable();
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
     * Constructs collection, grabbing the needed constructor to do so.
     * 
     * @param  {Object} config The config to construct with.
     * @return {Collection} The constructed collection.
     */
    static constructCollection(config) {
        const constructor = types.get(config.type) || Content;
        return new constructor(config);
    }

    /**
     * Creates a new collection with the specified type and title.
     * If the type is not a valid type, then an error will be thrown and can be caught from the
     * promise.  This returns the newly created collection when the promise resolves.
     * 
     * @param  {String} type The type of the collection to create.
     * @param  {String} title The title of the collection to create.
     * @return {Promise}      The promise to provide the newly created collection.
     */
    static createCollection(type, title) {
        const connection = DatabaseManager.instance.connection;
        const uuid = Uuid();
        if (!types.has(type)) {
            return Promise.reject(new Error("Invalid Type:", type));
        }
        return connection(COLLECTION_TABLE_NAME).insert({
            uuid: uuid,
            type: type,
            title: title,
            contents: JSON.stringify([]),
            permissions: JSON.stringify({}),
            meta: JSON.stringify({}),
            data: JSON.stringify({})
        }).then(dbid => {
            const config = {
                dbid: dbid,
                uuid: uuid,
                type: type,
                title: title,
                contents: [],
                permissions: {},
                meta: {},
                data: {}
            };
            return Collection.constructCollection(config);
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
                return Collection.constructCollection(result);
            }));
    }

    /**
     * Retrieves a list of collections based on its type.
     * This is generally to query for all dumps or for all blogs (the current two at the writing of this.)
     * 
     * @param  {String} type The string id of the collection type to find.
     * @return {Promise}      A promise to return a list of collections (may be none)
     */
    static getCollectionsByType(type) {
        return Collection.getCollections({
            type: type
        });
    }

    /**
     * Returns a singular collection matching the query or null if no collection is found to match the query.
     * This returns a promise that resolves when the query to the database returns.
     * 
     * @param  {Object} query The query object
     * @return {Promise} The promise to return the first collection to match the query.
     */
    static getCollection(query) {
        return Collection.getCollections(query)
            .then(collections => collections.length > 0 ? collections[0] : null);
    }

    static getCollectionByUUID(id) {
        return Collection.getCollection({ uuid: id });
    }
    static getCollectionByTitle(title) {
        return Collection.getCollection({ title: title });
    }

    constructor(config) {
        this.dbid = config.dbid;
        this.uuid = config.uuid;
        this.type = config.type;

        this.title = config.title;

        /** @type {String[]} A list of all the content contained within this collection */
        this.contents = JSON.parse(config.contents);

        this.permissions = JSON.parse(config.permissions);
        this.meta = JSON.parse(config.meta);
        this.data = JSON.parse(config.data);

        /** @type {String} The path to the save directory of the collection */
        this.saveDirectory = path.join(collectionsDirectory, this.type, this.uuid);
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
                title: this.title,
                contents: JSON.stringify([]),
                permissions: JSON.stringify(this.permissions),
                settings: JSON.stringify(this.settings),
                meta: JSON.stringify(this.meta),
                data: JSON.stringify(this.data)
            });
    }

    /**
     * Adds a content item to the collection.
     * This merely changes the live version of the collection, if one wishes to 
     *
     * @param {Content} content The content item to add to the collection.
     */
    addContent(content) {
        this.content.push(content.dbid);
    }

    /**
     * performs a query to retrieve all content.
     * This makes use of all the dbids within the contents.
     * This performs a specialized query.
     *
     * @return {Promise} A promise to get all the content.
     */
    getContents() {
        return Content.getContentsInList("dbid", this.contents);
    }
}

module.exports = Collection;