"use strict";

const express = require("express");
const router = express.Router();

const Account = require(process.cwd() + "/modules/models/Account");
const Logger = require(process.cwd() + "/modules/Logger");

const templates = require(process.cwd() + "/templates/templates");
const authPage = templates(__dirname + "/pages/auth");
const globalLayout = require("./layouts/global");

/* GET home page. */
router.get("/", (request, response) => {
    response.send(globalLayout(request, authPage({
        pageTitle: "Sign In"
    }), {
        styles: ["/stylesheets/auth.css"],
        scripts: ["/javascripts/built/auth-entry.js"],
        pageTitle: "Sign In"
    }));
});

router.post("/signin", (request, response) => {
    const session = request.session;
    if (session.account) {
        response.status(403).json({
            message: "Already signed in"
        });
    }
    const body = request.body;
    const email = body.email;
    const password = body.password;
    if (email === "root" && Account.root.verify(password)) {
        session.account = Account.root;
        response.status(200).json({
            message: "Successful signin",
            redirect: "/account"
        });
        return;
    }

    Account.getAccountByEmail(email).then((account) => {
        if (account && account.verify(password)) {
            session.account = account;
            response.status(200).json({
                message: "Successful signin",
                redirect: "/account"
            });
        } else {
            response.status(200).json({
                message: "Failed to sign in with email and password combination"
            });
        }
    }).catch((error) => {
        response.status(500).json({ message: "Internal Server Error" });
        Logger.error("/auth/signin", error);
    });
});

router.get("/signout", (request, response) => {
    const session = request.session;
    session.account = null;
    response.redirect("/auth");
});

module.exports = router;