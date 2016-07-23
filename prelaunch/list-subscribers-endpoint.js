var kvfs = require("kvfs")(".subscriber-data");
var async = require("async");
var fs = require("fs");
var path = require("path");
var renderView = require("../renderView.js");

module.exports = function(req, res) {
    if(req.query.secret != "1241215124125123122215124") {
        return res.fail(400, "You don't know the secret, bruv.");
    }
    kvfs.list("subscription", function(error, subscriptions) {
        if(error) {
            console.error("Failed to get subscription list", error);
            return res.fail(500);
        }
        async.map(subscriptions, function(subscription, callback) {
            kvfs.get(subscription, callback);
        }, function(error, subscriptionContents) {
            subscriptionContents = subscriptionContents.filter(x => x.state == "subscribed");
            if(error) {
                console.error("Failed to read one or more subscriptions", error);
                return res.fail(500);
            }
            fs.readFile(path.join(__dirname, "list-subscribers-view.html"), function(error, viewBuf) {
                if(error) {
                    console.error("Failed to read list-subscribers-view", error);
                    return res.fail(500);
                }
                renderView(viewBuf.toString(), { subscribers: subscriptionContents }, function(error, response) {
                    if(error) {
                        console.error("Failed to render subscriber list", error);
                        return res.fail(500);
                    }
                    res.send(response);
                });
            });
        });
    });
};
