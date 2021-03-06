var express = require("express");
var bodyParser = require("body-parser");
var errorResponses = require("./error/responses.js");
var pkg = require("./package.json");
var subscribeEndpoint = require("./prelaunch/subscribe-endpoint.js");
var unsubscribeEndpoint = require("./prelaunch/unsubscribe-endpoint.js");
var staticViewEndpoint = require("./staticViewEndpoint.js");
var postgresStatusEndpoint = require("./status/postgres.js");
var path = require("path");
var Pool = require("pg-pool");
var config = require("config");
var ensureProjectionsTable = require("./ensureProjectionsTable.js");
var frontPageSelector = require("./frontPageSelector.js");
var cookieSession = require("cookie-session");
var adminApp = require("./admin/app.js");
var MailgunMustacheMailer = require("mailgun-mustache-mailer");
var salesEndpoint = require("./sales/endpoint.js");
var braintree = require("braintree");
var getVoucherEndpoint = require("./voucher/getEndpoint.js");

var pool = new Pool(config.postgres);
var mailer = new MailgunMustacheMailer(config.mailgun);
config.braintree.environment = braintree.Environment[config.braintree.environment];
var paymentGateway = braintree.connect(config.braintree);

ensureProjectionsTable(pool);

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieSession({
    name: "etree-session-cookie",
    secret: "55b6b85d-46b2-47fe-9225-81c58faa432b"
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
app.get("/bliv-afhentningssted", staticViewEndpoint("prelaunch/bliv-afhentningssted/view.html"));
app.post("/buy", salesEndpoint(pool, mailer, paymentGateway));
app.post("/subscribe", subscribeEndpoint(pool));
app.get("/du-er-paa-listen", staticViewEndpoint("prelaunch/subscription-succesful-view.html"));
app.get("/unsubscribe/:id", unsubscribeEndpoint(pool));
app.get("/unsubscribed", staticViewEndpoint("prelaunch/unsubscribed-succesfully.html"));
app.get("/om", staticViewEndpoint("about/view.html"));
app.get("/pg-status", postgresStatusEndpoint());
app.get("/bliv-udbringer", staticViewEndpoint("become-deliverer/view.html"));
app.use("/admin", adminApp(pool, mailer));
app.get("/tak-for-handlen", staticViewEndpoint("sales/thanks.html"));
app.get("/voucher/:id", getVoucherEndpoint(pool));

app.use(function endpointNotFound(req, res) {
    res.fail(404);
});

app.listen(3000);

console.log("Started etree2 app version " + pkg.version + ", listening on port 3000");
