var express = require("express");
var overviewEndpoint = require("./overview/endpoint.js");
var addDeliveristEndpoint = require("./add-deliverist/endpoint.js");
var deleteDeliveristEndpoint = require("./delete-deliverist/endpoint.js");
var updateDeliveristEndpoint = require("./update-deliverist/endpoint.js");

module.exports = function(events) {
    var app = express();
    
    app.get("/", overviewEndpoint(events));
    app.post("/deliverist", addDeliveristEndpoint(events));
    app.get("/deliverist/:id/delete", deleteDeliveristEndpoint(events));
    app.post("/deliverist/:id", updateDeliveristEndpoint(events));
    
    return app;
};
