var express = require("express");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var kvfs = require("kvfs")(".subscriber-data");
var uuid = require("uuid");
var async = require("async");
var pkg = require("./package.json");

var error404Page = fs.readFileSync(path.join(__dirname, "error/404.html")).toString();
var error500Page = fs.readFileSync(path.join(__dirname, "error/500.html")).toString();

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", function(req, res) {
    fs.readFile(path.join(__dirname, "prelaunch/view.html"), function(error, buf) {
        if(error) {
            console.error("Failed to read prelaunch view", error);
            return res.status(500).send(error500Page);
        }
        res.send(buf.toString());
    });
});

app.post("/subscribe", function(req, res) {
    if(!req.body.email) {
        return res.status(400).send("No email supplied");
    }
    if(!isValidEmail(req.body.email)) {
        return res.status(400).send("Invalid email " + req.body.email);
    }
    var id = uuid.v4();
    kvfs.set("subscription/" + id, {
        email: req.body.email,
        subscribed_at: new Date().toISOString(),
        state: "subscribed"
    }, function(error) {
        if(error) {
            console.error("Failed to save subscription for " + req.body.email, error);
            return res.status(500).send("Failed to save subscription");
        }
        //TODO: Send email, show results page.
        res.send("Done.");
    });
});

function isValidEmail(email) {
    return email.match(/^.+@.+$/);
}

app.get("/list-subscribers", function(req, res) {
    if(req.query.secret != "1241215124125123122215124") {
        return res.send("You don't know the secret, bruv");
    }
    kvfs.list("subscription", function(error, subscriptions) {
        if(error) {
            console.error("Failed to get subscription list", error);
            return res.status(500).send("Failed to get subscription list");
        }
        async.map(subscriptions, function(subscription, callback) {
            kvfs.get(subscription, callback);
        }, function(error, subscriptionContents) {
            if(error) {
                console.error("Failed to read one or more subscriptions", error);
                return res.status(500).send("Failed to read one or more subscriptions");
            }
            res.send(subscriptionContents);
        });
    });
});

app.use(function endpointNotFound(req, res) {
    res.status(404).send(error404Page);
});

app.listen(3000);

console.log("Started etree2 app version " + pkg.version + ", listening on port 3000");
