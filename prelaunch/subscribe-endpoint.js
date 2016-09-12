var uuid = require("uuid");
var kvfs = require("kvfs")(".subscriber-data");
var errorResponses = require("../error/responses.js");
var Pool = require("pg-pool");
var config = require("config");

var createTableIfNotExists = require("./createTableIfNotExists.js");
createTableIfNotExists();

module.exports = function(req, res) {
    if(!req.body.email) {
        return res.fail(400, "Ingen email blev angivet.");
    }
    if(!isValidEmail(req.body.email)) {
        return res.fail(400, req.body.email + " er en ugyldig email.");
    }
    var id = uuid.v4();
    var pool = new Pool(config.postgres);
    pool.query("INSERT INTO user_signed_up_for_newsletter (id, happened_at, data) VALUES ('" + id + "', '" + new Date().toISOString() + "', '" + JSON.stringify({ email: req.body.email }) + "')", (error) => {
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
