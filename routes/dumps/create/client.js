"use strict";

const Utils = require("WebUtils");

const $ = document.querySelector.bind(document);

const createName = $("#create-name");
const createDescription = $("#create-description");
const createButton = $("#create-button");

createButton.addEventListener("click", () => {
    const name = createName.value;
    const description = createDescription.value;
    if (name.length <= 0) {
        window.alert("Name not entered");
        return;
    }

    Utils.sendPost("/dumps/create", {
        name: name,
        description: description
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