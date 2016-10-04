var express = require("express");
var adminEndpoint = require("./endpoint.js");
var adminAuthEndpoint = require("./authEndpoint.js");
var authenticate = require("./authenticate.js");
var ensureFirstAdmin = require("./ensureFirstAdmin.js");

function createAdminApp(pool) {
    var app = express();
    
    app.get("/", authenticate(pool), adminEndpoint(pool));
    app.post("/", adminAuthEndpoint(pool));
    
    return app;
}

module.exports = function(pool) {
    ensureFirstAdmin(pool);
    return createAdminApp(pool);
};
