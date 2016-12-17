var express = require("express");
var overviewEndpoint = require("./overview/endpoint.js");
var roughSendReceiptEndpoint = require("./rough-send-receipt/endpoint.js");

module.exports = function(pool, mailer) {
    var app = express();
    
    app.get("/", overviewEndpoint(pool));
    app.get("/send-receipt/:id", roughSendReceiptEndpoint(pool, mailer));
    
    return app;
};
