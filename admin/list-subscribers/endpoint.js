var fs = require("fs");
var path = require("path");
var renderView = require("../../renderView.js");
var ensureSubscriptionsProjection = require("./ensureSubscriptionsProjection.js");
var getActiveSubscriptions = require("./getActiveSubscriptions.js");

function listSubscribersEndpoint(pool, req, res) {
    getActiveSubscriptions(pool, (error, subscriptions) => {
        if(error) {
            console.error("Failed to get active subscriptions", error);
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

module.exports = function(pool) {
    ensureSubscriptionsProjection(pool);
    return listSubscribersEndpoint.bind(this, pool);
};
