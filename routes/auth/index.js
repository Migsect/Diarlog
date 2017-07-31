"use strict";

const express = require("express");
const router = express.Router();

const Account = require(process.cwd() + "/modules/models/Account");
const Logger = require(process.cwd() + "/modules/Logger");

const templates = require(process.cwd() + "/templates/templates");
const page = templates(__dirname + "/page");
const globalLayout = require(process.cwd() + "/layouts/global");

/* GET sign in page. */
router.get("/", (request, response) => {
    const session = request.session;
    if (session.account) {
        response.redirect("/account");
    }
    response.send(globalLayout(request, page({
        pageTitle: "Sign In"
    }), {
        styles: ["/stylesheets/auth/styles.css"],
        scripts: ["/javascripts/built/auth/client-entry.js"],
        pageTitle: "Sign In"
    }));
});

/* POST signs in a user, rejects if email+password fail to verify or not enough info is given */
router.post("/signin", (request, response) => {
    const session = request.session;
    if (session.account) {
        response.status(403).json({
            message: "Already signed in",
            redirect: "/account"
        });
        return;
    }
    const body = request.body;
    const email = body.email.trim();
    const password = body.password.trim();
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

/* GET signs out a user. This works regardless of whether the user was signed in or not. */
router.get("/signout", (request, response) => {
    const session = request.session;
    session.account = null;
    response.redirect("/auth");
});

module.exports = router;