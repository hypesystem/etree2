var express = require("express");
var adminEndpoint = require("./endpoint.js");
var adminAuthEndpoint = require("./authentication/authEndpoint.js");
var authenticate = require("./authentication/authenticate.js");
var ensureFirstAdmin = require("./ensureFirstAdmin.js");
var listSubscribersEndpoint = require("./list-subscribers/endpoint.js");
var logoutEndpoint = require("./authentication/logoutEndpoint.js");
var staticViewEndpoint = require("../staticViewEndpoint.js");

function createAdminApp(pool) {
    var app = express();
    
    app.get("/", authenticate(pool), adminEndpoint(pool));
    app.get("/login", staticViewEndpoint("admin/authentication/loginView.html"));
    app.post("/login", adminAuthEndpoint(pool));
    app.get("/list-subscribers", authenticate(pool), listSubscribersEndpoint(pool));
    app.get("/logout", authenticate(pool), logoutEndpoint);
    
    return app;
}

module.exports = function(pool) {
    ensureFirstAdmin(pool);
    return createAdminApp(pool);
};
