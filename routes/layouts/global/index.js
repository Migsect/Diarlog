"use strict";

const templates = require(process.cwd() + "/templates/templates");
const layoutTemplate = templates(__dirname + "/global");

const layoutConfig = require(process.cwd() + "/config/general").layout;
const siteTitle = layoutConfig.name || "NO NAME SPECIFIED";
const copyright = layoutConfig.copyright;

module.exports = function(request, view, options) {
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
        copyright: copyright
    });
};