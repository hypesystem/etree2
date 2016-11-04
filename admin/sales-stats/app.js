var express = require("express");
var overviewEndpoint = require("./overview/endpoint.js");

module.exports = function(pool) {
    var app = express();
    
    app.get("/", overviewEndpoint(pool));
    
    return app;
};
