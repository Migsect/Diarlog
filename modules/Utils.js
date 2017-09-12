"use strict";

class Utils {
    /**
     * Attempts to convert the input into an object.
     * If the input is already an object, it will return the object.
     * If the input is a string, it will attempt to convert it into an
     * object.
     * Otherwise this will return null (if it's a number, null, etc)
     * 
     * @param input The input to convert into an object
     * @returns {Object} The input converted into an object 
     */
    static toObject(input) {
        if (typeof input === "object") {
            return input;
        } else if (typeof input === "string") {
            try {
                return JSON.parse(input);
            } catch (e) {
                /* Not going to show the error, just going to return null */
                return null;
            }
        }
        return null;
    }
}
module.exports = Utils;