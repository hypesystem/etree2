var uuid = require("uuid");
var createUserSubscriptionTableIfNotExists = require("./createUserSubscriptionTableIfNotExists.js");
var fs = require("fs");
var path = require("path");
var addUserSubscribedEventSql = fs.readFileSync(path.join(__dirname, "addUserSubscribed.sql")).toString();

function subscribeEndpoint(pool, req, res) {
    if(!req.body.email) {
        return res.fail(400, "Ingen email blev angivet.");
    }
    if(!isValidEmail(req.body.email)) {
        return res.fail(400, req.body.email + " er en ugyldig email.");
    }
    var id = uuid.v4();
    pool.query(addUserSubscribedEventSql, [id, new Date().toISOString(), JSON.stringify({ email: req.body.email })], (error) => {
        if(error) {
            console.error("Failed to save subscription for " + req.body.email, error);
            return res.fail(500);
        }
        //TODO: Send email to admin with notif
        res.redirect("/du-er-paa-listen");
    });
}

function isValidEmail(email) {
    return email.match(/^.+@.+$/);
}

module.exports = function(pool) {
    createUserSubscriptionTableIfNotExists(pool);
    return subscribeEndpoint.bind(this, pool);
};
