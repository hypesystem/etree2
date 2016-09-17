var kvfs = require("kvfs")(".subscriber-data");
var async = require("async");
var fs = require("fs");
var path = require("path");
var renderView = require("../../renderView.js");
var buildSubscriptionsState = require("./buildSubscriptionsState.js");

function listSubscribersEndpoint(pool, req, res) {
    if(req.query.secret != "1241215124125123122215124") {
        return res.fail(400, "You don't know the secret, bruv.");
    }
    getActiveSubscriptions(pool, (error, subscriptions) => {
        if(error) {
            return res.fail(500);
        }
        fs.readFile(path.join(__dirname, "view.html"), function(error, viewBuf) {
            if(error) {
                console.error("Failed to read list subscribers view", error);
                return res.fail(500);
            }
            renderView(viewBuf.toString(), { subscribers: subscriptions }, function(error, response) {
                if(error) {
                    console.error("Failed to render subscriber list", error);
                    return res.fail(500);
                }
                res.send(response);
            });
        });
    });
}

function getActiveSubscriptions(pool, callback) {
    buildSubscriptionsState(pool, callback);
}

module.exports = function(pool) {
    return listSubscribersEndpoint.bind(this, pool);
};
