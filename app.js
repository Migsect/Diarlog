"use strict";

const http = require("http");
const express = require("express");
const path = require("path");

const Logger = require(process.cwd() + "/modules/Logger");

const config = require("./config/general");

const app = express();
const server = http.createServer(app);

/* ########################################################################## *
 * # Handling database initialization                                       # *  
 * ########################################################################## */

const DatabaseManager = require("./modules/Database/DatabaseManager");
require("./modules/models/Account").initializeDatabase();

/* ########################################################################## *
 * # Setting up sessions and other middleware                               # *  
 * ########################################################################## */
app.locals.middleware = {};

/* Setting up winston for logging */
const winston = require("winston");
const expressWinston = require("express-winston");
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ],
    meta: false,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: true,
    ignoreRoute: function() {
        return false;
    }
}));

// const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var sassMiddleware = require('node-sass-middleware');
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(sassMiddleware({
    /* Options */
    src: path.join(__dirname, "styles"),
    dest: path.join(__dirname, "/public/stylesheets"),
    debug: true,
    response: true,
    outputStyle: "compressed",
    prefix: "/stylesheets", // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
    log: function(severity, key, value) {
        Logger[severity]("[sass]", key, ":", value);
    },
    error: function(severity, key, value) {
        Logger[severity]("[sass]", key, ":", value);
    }
}));

/* Session setup */
const session = app.locals.middleware = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const appSession = session({
    store: new KnexSessionStore({
        createtable: true,
        tablename: "sessions",
        knex: DatabaseManager.instance.connection
    }),
    secret: config.sessions.secret ? config.sessions.secret : "secrety secret",
    cookie: {
        maxAge: config.sessions.maxAge ? config.sessions.maxAge : 3600000 /* An hour */
    },
    resave: true,
    saveUninitialized: true
});
app.use(appSession);

/* ########################################################################## *
 * # Socket.io initialization                                               # *  
 * ########################################################################## */

const io = require("socket.io")(server);
const sharedsession = require("express-socket.io-session");

io.use(sharedsession(app.locals.middleware.session, {
    autoSave: true
}));

/* ########################################################################## *
 * # Setting up the routes                                                  # *  
 * ########################################################################## */

const index = require("./routes/index");
const auth = require("./routes/auth");
const blogs = require("./routes/blogs");
const dumps = require("./routes/dumps");
const collaborators = require("./routes/auth");

app.use("/", index);
app.use("/auth", auth);
app.use("/blogs", blogs);
app.use("/dumps", dumps);
app.use("/collaborators", collaborators);

/* ########################################################################## *
 * # Developer / Debug Stuff                                                # *  
 * ########################################################################## */

/* catch 404 and forward to error handler */
app.use(function(request, response, next) {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

/* error handler */
app.use(function(error, request, response /* next */ ) {
    // set locals, only providing error in development
    response.locals.message = error.message;
    response.locals.error = request.app.get("env") === "development" ? error : {};

    // render the error page
    response.status(error.status || 500);
    response.render("error");
});

module.exports = {
    app: app,
    server: server
};