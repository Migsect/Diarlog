"use strict";

const path = require("path");

module.exports = {
    entry: {
        auth: "./web_modules/entry/auth.js",
        "blogs/blog": "./web_modules/entry/blogs/blog.js",
        "blogs/blogCreate": "./web_modules/entry/blogs/blogCreate.js",
        "dumps/dump": "./web_modules/entry/dumps/dump.js",
        "dumps/dumpCreate": "./web_modules/entry/dumps/dumpCreate.js"
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