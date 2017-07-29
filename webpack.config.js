"use strict";

const path = require("path");
const fs = require("fs-extra");

function constructEntries(directory, topLevel = true) {
    const entries = {};
    const files = fs.readdirSync(directory);
    files.forEach((file) => {
        const filePath = path.join(directory, file);
        const dirname = topLevel ? "" : path.basename(path.dirname(filePath));
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const subEntries = constructEntries(filePath, false);
            for (let key in subEntries) {
                entries[path.join(dirname, key)] = subEntries[key];
            }
        } else if (file.trim().endsWith("client.js")) {
            const basename = path.basename(filePath);
            entries[path.join(dirname, basename.substring(0, basename.lastIndexOf(".js")))] = "./" + filePath;
        }
    });
    return entries;
}

module.exports = {
    entry: constructEntries("./routes"),
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