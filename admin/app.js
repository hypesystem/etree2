var express = require("express");
var adminEndpoint = require("./endpoint.js");
var adminAuthEndpoint = require("./authentication/authEndpoint.js");
var authenticate = require("./authentication/authenticate.js");
var ensureFirstAdmin = require("./ensureFirstAdmin.js");
var listSubscribersEndpoint = require("./list-subscribers/endpoint.js");
var logoutEndpoint = require("./authentication/logoutEndpoint.js");
var staticViewEndpoint = require("../staticViewEndpoint.js");
var adminManagementApp = require("./manage/app.js");
var createAdminUpdateTableIfNotExists = require("./createAdminUpdateTableIfNotExists.js");
var emailEndpoint = require("./send-email/endpoint.js");

function createAdminApp(pool) {
    var app = express();
    
    app.get("/", authenticate(pool), adminEndpoint(pool));
    app.get("/login", staticViewEndpoint("admin/authentication/loginView.html"));
    app.post("/login", adminAuthEndpoint(pool));
    app.get("/list-subscribers", authenticate(pool), listSubscribersEndpoint(pool));
    app.get("/logout", authenticate(pool), logoutEndpoint);
    app.use("/manage", authenticate(pool), adminManagementApp(pool));
    app.get("/email", authenticate(pool), staticViewEndpoint("admin/send-email/form.html"));
    app.post("/email", authenticate(pool), emailEndpoint(pool));
    
    return app;
}

module.exports = function(pool) {
    ensureFirstAdmin(pool);
    createAdminUpdateTableIfNotExists(pool, error => {
        if(error) {
            console.error("Failed to ensure admin_updated table on launch", error);
        }
    });
    return createAdminApp(pool);
};
