/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Utils = __webpack_require__(1);

const $ = document.querySelector.bind(document);

const signinPanel = $("#signin-panel");
const signinEmail = $("#signin-email");
const signinPassword = $("#signin-password");
const signinButton = $("#signin-button");

signinPanel.addEventListener("keyup", (event) => {
    event.preventDefault();
    if (event.keyCode == 13) {
        signinButton.click();
    }
});
signinButton.addEventListener("click", () => {
    const email = signinEmail.value;
    const password = signinPassword.value;
    if (email.length <= 0) {
        window.alert("Email not entered.");
        return;
    }
    if (password.length <= 0) {
        window.alert("Password not entered.");
        return;
    }
    Utils.sendPost("/auth/signin", {
        email: email,
        password: password
    }).then((response) => {
        const status = response.status;
        const message = response.message;
        const redirect = response.redirect;
        console.log("response:", status, message);
        if (redirect) {
            console.log("redirect:", redirect);
            window.location = redirect;
        }
    }).catch((request) => {
        window.alert("Internal Server Error");
        console.log("Internal Server Error", request);
    });
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global decodeURIComponent */

// var Utils = {};

class Utils {

    /**
     * The node list to convert to an array of nodes
     * @param  {NodeList} nodeList The node list
     * @return {Node[]}           The converted array of nodes
     */
    static convertNodeListToArray(nodeList) {
        return Array.prototype.slice.call(nodeList, 0);
    }

    /**
     * Does a document.querySelectorAll but makes it into a standard array instead of
     * a node list making it better to work with.
     * 
     * @param  {String} queryString The query String
     * @return {HTMLElement[]}      A list of the html elements
     */
    static querySelectorAll(queryString, context) {
        if (!context) {
            context = document;
        }
        return Utils.convertNodeListToArray(context.querySelectorAll(queryString));
    }

    /**
     * Sends a post request with the json as the data to the specified URL
     * 
     * @param  {String} url  The URL to send the post to
     * @param  {Json} json A json object to send
     * @return {XMLHttpRequest}      The requuest that was sent
     */
    static sendPostRequest(url, json) {
        var request = new XMLHttpRequest();
        request.open("POST", url, true);
        request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8; charset=UTF-8');
        request.send(JSON.stringify(json));
        return request;
    }

    static sendPost(url, json) {
        return new Promise(function(resolve, reject) {
            const request = new XMLHttpRequest();
            request.open("POST", url, true);
            request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8; charset=UTF-8');
            request.onload = () => {
                const status = request.status;
                try {
                    const response = JSON.parse(request.responseText);
                    response.status = status;
                    resolve(response, request);
                } catch (error) {
                    reject(error);
                }
            };
            request.onerror = () => {
                reject();
            };
            request.send(JSON.stringify(json));

        });
    }

    /**
     * Retrieves the value of a paramter in a URL.
     * 
     * @param  {String} name The name of the parameter to extract.
     * @param  {String} url  The url to extract the paremter from.
     * @return {String}      The parameter's value.
     */
    static getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    /**
     * Converts an HTML string into a DOM node.
     * Mostly meant to be used with templates.
     * 
     * @param  {String} html The html string to covnert to a node.
     * @return {DOMNode}     The resulting node from the string.
     */
    static htmlToElement(html) {
        var template = document.createElement("template");
        template.innerHTML = html;
        return template.content.firstChild;
    }

    static escapeHTML(html) {
        return String(html)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

}
module.exports = Utils;

module.exports = Utils;

/***/ })
/******/ ]);