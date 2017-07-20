"use strict";

const url = require("url");

const templates = require(process.cwd() + "/templates/templates");
const layoutTemplate = templates(__dirname + "/global");

const layoutConfig = require(process.cwd() + "/config/general").layout;
const siteTitle = layoutConfig.siteTitle || "NO NAME SPECIFIED";
const copyright = layoutConfig.copyright;

const coreNavigation = [{
        display: "Home",
        address: "/"
    }, {
        display: "Blogs",
        address: "/blogs"
    },
    {
        display: "Dumps",
        address: "/dumps"
    }
];

const coreLinks = [{
        display: "Collaborators",
        address: "/collaborators"
    },
    {
        display: "Diarlog",
        address: "https://github.com/Migsect/Diarlog"
    },
    {
        display: "Sign in",
        address: "/auth"
    }
];

module.exports = function(request, view, options) {
    const pagePath = url.parse(request.originalUrl).pathname;
    const account = request.session ? request.session.account : null;
    const styles = (options && options.styles) || [];
    const scripts = (options && options.scripts) || [];
    const pageTitle = (options && options.pageTitle) || null;
    return layoutTemplate({
        view: view,
        styles: styles,
        scripts: scripts,
        account: account,
        pageTitle: pageTitle,
        siteTitle: siteTitle,
        copyright: copyright,
        navigation: coreNavigation.map((item) => {
            const newItem = Object.assign({}, item);
            if (item.address.trim() === pagePath) {
                newItem.active = true;
            }
            return newItem;
        }),
        links: coreLinks
    });
};