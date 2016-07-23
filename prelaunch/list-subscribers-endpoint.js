var kvfs = require("kvfs")(".subscriber-data");
var async = require("async");
var errorResponses = require("../error/responses.js");

module.exports = function(req, res) {
    if(req.query.secret != "1241215124125123122215124") {
        return res.send("You don't know the secret, bruv");
    }
    kvfs.list("subscription", function(error, subscriptions) {
        if(error) {
            console.error("Failed to get subscription list", error);
            return res.status(500).send(errorResponses[500]);
        }
        async.map(subscriptions, function(subscription, callback) {
            kvfs.get(subscription, callback);
        }, function(error, subscriptionContents) {
            if(error) {
                console.error("Failed to read one or more subscriptions", error);
                return res.status(500).send(errorResponses[500]);
            }
            res.send(subscriptionContents);
        });
    });
};
