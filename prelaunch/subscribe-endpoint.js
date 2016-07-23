var uuid = require("uuid");
var kvfs = require("kvfs")(".subscriber-data");
var errorResponses = require("../error/responses.js");

module.exports = function(req, res) {
    if(!req.body.email) {
        return res.fail(400, "Ingen email blev angivet.");
    }
    if(!isValidEmail(req.body.email)) {
        return res.fail(400, req.body.email + " er en ugyldig email.");
    }
    var id = uuid.v4();
    kvfs.set("subscription/" + id, {
        email: req.body.email,
        subscribed_at: new Date().toISOString(),
        state: "subscribed"
    }, function(error) {
        if(error) {
            console.error("Failed to save subscription for " + req.body.email, error);
            return res.fail(500);
        }
        //TODO: Send email to admin with notif
        res.redirect("/du-er-paa-listen");
    });
};

function isValidEmail(email) {
    return email.match(/^.+@.+$/);
}
