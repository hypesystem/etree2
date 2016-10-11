var express = require("express");
var staticViewEndpoint = require("../../staticViewEndpoint.js");
var adminOverviewEndpoint = require("./adminOverviewEndpoint.js");
var createAdminEndpoint = require("./createAdminEndpoint.js");
var updateAdminEndpoint = require("./updateAdminEndpoint.js");
var updatePasswordEndpoint = require("./updatePasswordEndpoint.js");

function createManageAdministratorsApp(pool) {
    var app = express();
    
    app.get("/", adminOverviewEndpoint(pool));
    app.post("/create", createAdminEndpoint(pool));
    app.post("/update", updateAdminEndpoint(pool));
    app.post("/update-password", updatePasswordEndpoint(pool));
    
    return app;
}

module.exports = createManageAdministratorsApp;
