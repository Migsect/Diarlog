"use strict";

module.exports = {
    database: {
        client: "sqlite3",
        connection: {
            filename: "./data/main.sqlite"
        },
        useNullAsDefault: true
    },
    data: {
        saveDirectory: "./data"
    },
    logging: {
        level: "debug",
        fileLevel: "info"
    },
    sessions: {
        secret: "macro dogos",
        maxAge: 86400000
    },
    layout: {
        siteTitle: "Diarlog Development",
        copyright: "2017 Alex Sammons"
    },
    accounts: {
        rootPassword: "root"
    }
};