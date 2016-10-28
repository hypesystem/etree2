var uuid = require("uuid");
var createUserSubscriptionTableIfNotExists = require("./createUserSubscriptionTableIfNotExists.js");
var fs = require("fs");
var path = require("path");
var addUserSubscribedEventSql = fs.readFileSync(path.join(__dirname, "addUserSubscribed.sql")).toString();
var ensureSubscriberVouchers2016 = require("./ensureSubscriberVouchers2016/ensure.js");
var Vouchers = require("../voucher/voucher.js");

function subscribeEndpoint(pool, vouchers, req, res) {
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
        
        //Create voucher (after redir)
        var year = new Date().getFullYear();
        vouchers.create(year + "-" + id, {
            name: "15% rabat på levering",
            rebate: 15,
            filters: [ "delivery" ]
        }, (error) => {
            if(error) {
                console.error("Failed to create prelaunch voucher for " + subscriber.id, error);
            }
        });
    });
}

function isValidEmail(email) {
    return email.match(/^.+@.+$/);
}

module.exports = function(pool) {
    createUserSubscriptionTableIfNotExists(pool);
    ensureSubscriberVouchers2016(pool);
    var vouchers = new Vouchers(pool);
    return subscribeEndpoint.bind(this, pool, vouchers);
};
