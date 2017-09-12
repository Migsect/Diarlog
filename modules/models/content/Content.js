"use strict";

const path = require("path");
const Uuid = require("uuid/v4");

const Utils = require(process.cwd() + "/modules/Utils");
const DatabaseManager = require(process.cwd() + "/modules/database/DatabaseManager");
const Logger = require(process.cwd() + "/modules/Logger");

const config = require(process.cwd() + "/config");
const contentDirectory = path.join((config.data && config.data.saveDirectory) || "./data", "content");

const CONTENT_TABLE_NAME = "content";
const types = new Map();

class Content {

    static get table() {
        return CONTENT_TABLE_NAME;
    }

    static get directory() {
        return contentDirectory;
    }

    static initializeDatabase() {
        const connection = DatabaseManager.instance.connection;
        return connection.schema.createTableIfNotExists(CONTENT_TABLE_NAME, function(table) {
            table.increments("dbid").primary().notNullable();
            table.uuid("uuid").notNullable();
            table.string("type").notNullable();
            table.string("title").notNullable();
            table.json("permissions").notNullable();
            table.json("meta").notNullable();
            table.json("data").notNullable();
        }).catch(error => {
            Logger.error(CONTENT_TABLE_NAME, error);
            throw error;
        });
    }

    /**
     * Registers a constructor to be used for the type of content.
     * Whenever a new collection is retrieved from the database or is created, this type will
     * be it's first class with a parent being the Content class.
     *
     * Thros an error if type already has been registered for by another sub-calss.
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
     * Constructs content, grabbing the needed constructor to do so.
     * 
     * @param  {Object} config The config to construct with.
     * @return {Content} The constructed content.
     */
    static constructContent(config) {
        const constructor = types.get(config.type) || Content;
        return new constructor(config);
    }

    /**
     * Creates a new content item with specified type and title.
     * 
     * @param  {String} type The type of the item, determines constructor.
     * @param  {String} title The title of the item, used for human readable ID.
     * @return {Promise} A promise to provide the created content item
     */
    static createContent(type, title) {
        const connection = DatabaseManager.instance.connection;
        const uuid = Uuid();
        if (!types.has(type)) {
            return Promise.reject(new Error("Invalid Type:", type));
        }
        return connection(CONTENT_TABLE_NAME).insert({
            uuid: uuid,
            type: type,
            title: title,
            permissions: JSON.stringify({}),
            meta: JSON.stringify({}),
            data: JSON.stringify({})
        }).then(dbid => {
            const config = {
                dbid: dbid[0],
                uuid: uuid,
                type: type,
                title: title,
                permissions: "{}",
                meta: "{}",
                data: "{}"
            };
            return Content.constructContent(config);
        });
    }

    /**
     * Retrieves all the contents in the database matching the query. If the contents do not
     * exist the returned promise will return an empty list.
     * 
     * @param  {Object} query the query object used to search for content
     * @return {Promise} A promise to return a list of content if any or find, otherwise it empty.
     */
    static getContents(query) {
        const connection = DatabaseManager.instance.connection;
        return connection(CONTENT_TABLE_NAME)
            .select()
            .where(query)
            .then(results => results.map(result => {
                return Content.constructContent(result);
            }));
    }

    /**
     * Retrieves all the contents that match the field and are in the list.
     * This is generally useful for grabbing all contents with specific ids (in one command).
     * For more complex queries, one may want to create a custom query.
     * 
     * @param  {String} field The field to match upon.
     * @param  {Object[]} list  List of field instances to match.
     * @return {Promise} A promise to return the list of found tiems.
     */
    static getContentsInList(field, list) {
        const connection = DatabaseManager.instance.connection;
        return connection(CONTENT_TABLE_NAME)
            .select()
            .whereIn(field, list)
            .then(results => results.map(result => {
                const constructor = types.get(result.type) || Content;
                return new constructor(result);
            }));
    }

    /**
     * Gets the first matching content item for the query.
     * Promise will return null if nothing could be found.
     * 
     * @param  {Object} query The query to search for.
     * @return {Promise} Promise to return the promise or null if not found.
     */
    static getContent(query) {
        return Content.getCollections(query)
            .then(contents => contents.length > 0 ? contents[0] : null);
    }

    constructor(config) {
        this.dbid = config.dbid;
        this.uuid = config.uuid;
        this.type = config.type;

        /** @type {String} A title is a human-readable identifier for content, but it is not unique */
        this.title = config.title;

        /** @type {Object} Permissions contain information on who can see and who can edit the content */
        this.permissions = Utils.toObject(config.permissions) || {};
        /** @type {Object} Describes the content such as owner, time of creation, etc */
        this.meta = Utils.toObject(config.meta) || {};
        /** @type {Object} Carries data pertaining to the content that may change based on type */
        this.data = Utils.toObject(config.data) || {};

        /** @type {String} the path to the save directory of the content used for high volume data */
        // this.saveDirectory = path.join(contentDirectory, this.uuid);
    }

    /**
     * Saves the content to the database.  This will override everything within the database with all 
     * fields of the changed content.
     * 
     * @return {} [description]
     */
    save() {
        const connection = DatabaseManager.instance.connection;
        return connection(CONTENT_TABLE_NAME)
            .where("dbid", this.dbid)
            .update({
                title: this.title,
                permissions: JSON.stringify(this.permissions),
                meta: JSON.stringify(this.meta),
                data: JSON.stringify(this.data)
            });
    }

}

module.exports = Content;