"use strict";

/**
 * Used to load and have a single reference to all templates.
 */

const logger = require(process.cwd() + "/modules/Logger");

const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");

/** @type {Map} Mapping of file locations to compiled templates of those files */
const compiled = new Map();

/**
 * Compiles a template File.
 * Caches all compiled files.
 * 
 * @param  {String} path The path of the template file.
 * @return {Object}      A Compiled template.
 */
function compileTemplate(templatePath) {
    if (compiled.has(templatePath)) {
        return compiled.get(templatePath);
    }
    const fullPath = fs.existsSync(templatePath + ".hbs") ? path.resolve(templatePath + ".hbs") : path.join(__dirname, templatePath + ".hbs");
    const file = fs.readFileSync(fullPath, 'utf-8');
    logger.debug("Compiling Template:", fullPath);

    const fileCompiled = handlebars.compile(file);
    compiled.set(templatePath, fileCompiled);

    return fileCompiled;
}

/** @type {Map} Mapping of file locations to precompiled templates of those files */
const precompiled = new Map();
/**
 * Precompiles a template file.
 * Caches all precompiled files.
 * 
 * @param  {String} path The path of the template file.
 * @return {Object}      The precompiled template.
 */
function precompileTemplate(templatePath) {
    if (precompiled.has(templatePath)) {
        return precompiled.get(templatePath);
    }
    const fullPath = fs.existsSync(templatePath + ".hbs") ? path.resolve(templatePath + ".hbs") : path.join(__dirname, templatePath + ".hbs");
    const file = fs.readFileSync(fullPath, 'utf-8');
    logger.debug("Precompiling Template:", fullPath);

    const fileCompiled = handlebars.precompile(file);
    compiled.set(templatePath, fileCompiled);

    return fileCompiled;
}

module.exports = compileTemplate;
Object.defineProperties(module.exports, {
    precompile: {
        value: precompileTemplate
    },
    compile: {
        value: compileTemplate
    }
});