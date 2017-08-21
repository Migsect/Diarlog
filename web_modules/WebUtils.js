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
    static sendFormData(url, formData) {
        return new Promise((resolve, reject) => {

            const request = new XMLHttpRequest();
            request.open("POST", url, true);
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
            request.send(formData);
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