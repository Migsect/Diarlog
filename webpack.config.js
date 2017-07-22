"use strict";

const path = require("path");

module.exports = {
    entry: {
        auth: "./web_modules/entry/auth.js"
    },
    output: {
        filename: "[name]-entry.js",
        path: __dirname + "/public/javascripts/built"
    },
    module: {
        loaders: [{
                test: /\.hbs$/,
                loader: "handlebars-loader"
            },
            {
                test: /\.css/,
                loaders: ["style-loader", "css-loader"]
            }
        ]
    },
    resolve: {
        modules: [
            "node_modules",
            "web_modules"
        ]
    }
};