var express = require("express");
var bodyParser = require("body-parser");
var errorResponses = require("./error/responses.js");
var pkg = require("./package.json");
var subscribeEndpoint = require("./prelaunch/subscribe-endpoint.js");
var unsubscribeEndpoint = require("./prelaunch/unsubscribe-endpoint.js");
var listSubscribersEndpoint = require("./prelaunch/list-subscribers/endpoint.js");
var staticViewEndpoint = require("./staticViewEndpoint.js");
var postgresStatusEndpoint = require("./status/postgres.js");
var path = require("path");
var Pool = require("pg-pool");
var config = require("config");
var ensureProjectionsTable = require("./ensureProjectionsTable.js");
var frontPageSelector = require("./frontPageSelector.js");

var pool = new Pool(config.postgres);

ensureProjectionsTable(pool);

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(function failMiddleware(req, res, next) {
    res.fail = function(errorCode, message) {
        res.status(errorCode);
        var errorResponseGenerator = errorResponses[errorCode];
        errorResponseGenerator(res, message);
        return res;
    };
    next();
});

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.get("/", frontPageSelector);
app.post("/subscribe", subscribeEndpoint(pool));
app.get("/du-er-paa-listen", staticViewEndpoint("prelaunch/subscription-succesful-view.html"));
app.get("/unsubscribe/:id", unsubscribeEndpoint(pool));
app.get("/unsubscribed", staticViewEndpoint("prelaunch/unsubscribed-succesfully.html"));
app.get("/list-subscribers", listSubscribersEndpoint(pool));
app.get("/om", staticViewEndpoint("about/view.html"));
app.get("/pg-status", postgresStatusEndpoint());

app.use(function endpointNotFound(req, res) {
    res.fail(404);
});

app.listen(3000);

console.log("Started etree2 app version " + pkg.version + ", listening on port 3000");
