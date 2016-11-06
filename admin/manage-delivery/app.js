var express = require("express");
var overviewEndpoint = require("./overview/endpoint.js");
var addDeliveristEndpoint = require("./add-deliverist/endpoint.js");

module.exports = function(pool) {
    var app = express();
    
    app.get("/", overviewEndpoint(pool));
    app.post("/deliverist", addDeliveristEndpoint(pool));
    
    return app;
};
