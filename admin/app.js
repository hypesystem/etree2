var express = require("express");
var adminEndpoint = require("./endpoint.js");
var adminAuthEndpoint = require("./authEndpoint.js");
var authenticate = require("./authenticate.js");
var ensureFirstAdmin = require("./ensureFirstAdmin.js");
var listSubscribersEndpoint = require("./list-subscribers/endpoint.js");
var logoutEndpoint = require("./logoutEndpoint.js");

function createAdminApp(pool) {
    var app = express();
    
    app.get("/", authenticate(pool), adminEndpoint(pool));
    app.post("/", adminAuthEndpoint(pool));
    app.get("/list-subscribers", authenticate(pool), listSubscribersEndpoint(pool));
    app.get("/logout", authenticate(pool), logoutEndpoint);
    
    return app;
}

module.exports = function(pool) {
    ensureFirstAdmin(pool);
    return createAdminApp(pool);
};
