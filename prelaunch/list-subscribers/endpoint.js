var kvfs = require("kvfs")(".subscriber-data");
var async = require("async");
var fs = require("fs");
var path = require("path");
var renderView = require("../../renderView.js");

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
    pool.query("SELECT * FROM user_signed_up_for_newsletter", (error, result) => {
        if(error) {
            console.error("[getActiveSubscriptions] Failed to get subscription list", error);
            return callback(error);
        }
        var subscriptionContents = result.rows.map(row => {
            return {
                id: row.id,
                email: row.data.email
            };
        });
        pool.query("SELECT * FROM user_unsubscribed_from_newsletter", (error, result) => {
            if(error) {
                console.error("[getActiveSubscriptions] Failed to check who has unsubscribed for subscriber list", error);
                return callback(error);
            }
            var unsubscribedEmails = result.rows.map(row => {
                var match = subscriptionContents.filter(subscription => subscription.id == row.id)[0];
                return match ? match.email : null;
            });
            var alreadyIncludedEmails = [];
            subscriptionContents = subscriptionContents.filter((subscription, index) => {
                if(unsubscribedEmails.indexOf(subscription.email) != -1) {
                    return false;
                }
                if(alreadyIncludedEmails.indexOf(subscription.email) != -1) {
                    return false;
                }
                alreadyIncludedEmails.push(subscription.email);
                return true;
            });
            callback(null, subscriptionContents);
        });
    });
}

module.exports = function(pool) {
    return listSubscribersEndpoint.bind(this, pool);
};
