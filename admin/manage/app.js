var express = require("express");
var staticViewEndpoint = require("../../staticViewEndpoint.js");
var adminOverviewEndpoint = require("./adminOverviewEndpoint.js");
var createAdminEndpoint = require("./createAdminEndpoint.js");
var updateAdminEndpoint = require("./updateAdminEndpoint.js");

function createManageAdministratorsApp(pool) {
    var app = express();
    
    app.get("/", adminOverviewEndpoint(pool));
    app.post("/create", createAdminEndpoint(pool));
    app.post("/update", updateAdminEndpoint(pool));
    
    return app;
}

module.exports = createManageAdministratorsApp;
