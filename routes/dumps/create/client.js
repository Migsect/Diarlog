"use strict";

const Utils = require("WebUtils");

const $ = document.querySelector.bind(document);

const createTitle = $("#create-title");
const createDescription = $("#create-description");
const createButton = $("#create-button");

createButton.addEventListener("click", () => {
    const title = createTitle.value;
    const description = createDescription.value;
    if (title.length <= 0) {
        window.alert("Title not entered");
        return;
    }
    Utils.sendPost("/dumps/create", {
        title: title,
        description: description
    }).then((response) => {
        const status = response.status;
        const message = response.message;
        const redirect = response.redirect;
        console.log("response:", status, message);
        if (status >= 400) {
            window.alert(message);
        }
        if (redirect) {
            console.log("redirect:", redirect);
            window.location = redirect;
        }
    }).catch((request) => {
        window.alert("Internal Server Error");
        console.log("Internal Server Error", request);
    });
});