var kvfs = require("kvfs")(".subscriber-data");
var async = require("async");
var fs = require("fs");
var path = require("path");
var renderView = require("../renderView.js");

function listSubscribersEndpoint(pool, req, res) {
    if(req.query.secret != "1241215124125123122215124") {
        return res.fail(400, "You don't know the secret, bruv.");
    }
    pool.query("SELECT * FROM user_signed_up_for_newsletter", (error, result) => {
        if(error) {
            console.error("Failed to get subscription list", error);
            return res.fail(500);
        }
        var subscriptionContents = result.rows.map(row => {
            return {
                email: row.data.email
            };
        });
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
}

module.exports = function(pool) {
    return listSubscribersEndpoint.bind(this, pool);
};
