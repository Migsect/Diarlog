"use strict";

const Utils = require("WebUtils");

const $ = document.querySelector.bind(document);

const signinPanel = $("#signin-panel");
const signinEmail = $("#signin-email");
const signinPassword = $("#signin-password");
const signinButton = $("#signin-button");

signinPanel.addEventListener("click", (event) => {
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
        console.log(response);
    }).catch((request) => {
        window.alert("There was an issue with the server...");
        console.log("There was an issue with the server:", request);
    });
});