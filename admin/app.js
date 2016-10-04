var express = require("express");
var adminEndpoint = require("./endpoint.js");
var adminAuthEndpoint = require("./authEndpoint.js");

function createAdminApp(pool) {
    var app = express();
    
    app.get("/", adminEndpoint(pool));
    app.post("/", adminAuthEndpoint(pool));
    
    return app;
}

module.exports = createAdminApp;
