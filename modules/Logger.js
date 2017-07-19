"use strict";

const winston = require("winston");
const prettyjson = require("prettyjson");

const config = require(process.cwd() + "/config/general");

const Logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            colorize: true,
            level: typeof config.logging.level == "undefined" ? "error" : config.logging.level,
            timestamp: function() {
                var date = new Date();
                return "[" + ("0" + date.getHours()).slice(-2) + ":" +
                    ("0" + date.getMinutes()).slice(-2) + ":" +
                    ("0" + date.getSeconds()).slice(-2) + "]";
            },
            prettyPrint: function(object) {
                return "\n" + prettyjson.render(object, {
                    keysColor: "cyan",
                    dashColor: "magenta",
                    stringColor: "yellow"
                });
            }
        })
    ]
});

module.exports = Logger;