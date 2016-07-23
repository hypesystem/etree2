var uuid = require("uuid");
var kvfs = require("kvfs")(".subscriber-data");
var errorResponses = require("./error/responses.js");

module.exports = function(req, res) {
    if(!req.body.email) {
        return res.status(400).send(errorResponses[400]("No email supplied"));
    }
    if(!isValidEmail(req.body.email)) {
        return res.status(400).send(errorResponses[400]("Invalid email " + req.body.email));
    }
    var id = uuid.v4();
    kvfs.set("subscription/" + id, {
        email: req.body.email,
        subscribed_at: new Date().toISOString(),
        state: "subscribed"
    }, function(error) {
        if(error) {
            console.error("Failed to save subscription for " + req.body.email, error);
            return res.status(500).send(errorResponses[500]);
        }
        //TODO: Send email to admin with notif
        res.redirect("/du-er-paa-listen");
    });
};

function isValidEmail(email) {
    return email.match(/^.+@.+$/);
}
