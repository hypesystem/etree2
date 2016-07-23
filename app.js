var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require("path");
var pkg = require("./package.json");
var subscribeEndpoint = require("./prelaunch/subscribe-endpoint.js");
var listSubscribersEndpoint = require("./prelaunch/list-subscribers-endpoint.js");
var staticViewEndpoint = require("./static-view-endpoint.js");

var error404Page = fs.readFileSync(path.join(__dirname, "error/404.html")).toString();
var error500Page = fs.readFileSync(path.join(__dirname, "error/500.html")).toString();

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.get("/", staticViewEndpoint("prelaunch/view.html"));
app.post("/subscribe", subscribeEndpoint);
app.get("/du-er-paa-listen", staticViewEndpoint("prelaunch/subscription-succesful-view.html"));
app.get("/list-subscribers", listSubscribersEndpoint);
app.get("/om", staticViewEndpoint("about/view.html"));

app.use(function endpointNotFound(req, res) {
    res.status(404).send(error404Page);
});

app.listen(3000);

console.log("Started etree2 app version " + pkg.version + ", listening on port 3000");
