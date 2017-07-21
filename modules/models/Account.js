"use strict";

const PasswordHash = require("password-hash");
const Uuid = require("uuid/v4");

const DatabaseManager = require("../database/DatabaseManager");
const Logger = require(process.cwd() + "/modules/Logger");

const ACCOUNT_TABLE_NAME = "account";

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
                table.string("name").notNullable();
                table.string("email").notNullable();
                table.string("password").notNullable();
                table.json("permissions").notNullable();
                table.json("settings").notNullable();
                table.json("data").notNullable();
            });
        });
    }

    static createAccount(name, email, plainPassword) {
        const connection = DatabaseManager.instance.connection;
        const password = PasswordHash.generate(plainPassword);
        const uuid = Uuid();

        return connection(ACCOUNT_TABLE_NAME).select("email").where(function() {
            this.where("email", email).orWhere("name", name);
        }).then(emails => {
            /* Checking to see if that email exists */
            if (emails.length > 0) {
                return null;
            }
            return connection(ACCOUNT_TABLE_NAME).insert({
                uuid: uuid,
                name: name,
                email: email,
                password: password,
                permissions: JSON.stringify({}),
                settings: JSON.stringify({}),
                data: JSON.stringify({})
            }).then(dbid => {
                const account = new Account({
                    dbid: dbid,
                    uuid: uuid,
                    name: name,
                    email: email,
                    password: password,
                    permissions: {},
                    settings: {},
                    data: {}
                });
                return account;
            });
        });
    }
    static getAccounts(query) {
        const connection = DatabaseManager.instance.connection;
        return connection(ACCOUNT_TABLE_NAME)
            .select()
            .where(query)
            .then(results => results.map(result => new Account(result)));
    }

    static getAccount(query) {
        return Account.getAccounts(query)
            .then(accounts => accounts.length > 0 ? accounts[0] : null);
    }

    static getAccountByUUID(id) {
        return Account.getAccount({ uuid: id });
    }

    static getAccountByEmail(email) {
        return Account.getAccount({ email: email });
    }

    static getAccountByName(name) {
        return Account.getAccount({ name: name });
    }

    constructor(config) {
        this.dbid = config.dbid;
        this.uuid = config.uuid;

        this.name = config.name;
        this.email = config.email;
        this.password = config.password;

        this.permissions = JSON.parse(config.permissions);
        this.settings = JSON.parse(config.settings);
        this.data = JSON.parse(config.data);
    }

    verify(passwordAttempt) {
        return PasswordHash.verify(passwordAttempt, this.password);
    }

    /**
     * Saves the Account to the database. (complete override of this state to the database)
     * 
     * @return {Promise} Promise that resolves when the saving is complete.
     */
    save() {
        const connection = DatabaseManager.instance.connection;
        return connection(ACCOUNT_TABLE_NAME)
            .where("dbid", this.dbid)
            .update({
                name: this.name,
                email: this.email,
                password: this.password,
                permissions: JSON.stringify(this.permissions),
                settings: JSON.stringify(this.settings),
                data: JSON.stringify(this.data)
            });
    }
}

module.exports = Account;