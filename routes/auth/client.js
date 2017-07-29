"use strict";

const Utils = require("WebUtils");

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