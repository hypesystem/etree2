var getAdminFromUsername = require("./getAdminFromUsername.js");
var crypto = require("crypto");

function adminAuthEndpoint(pool, req, res) {
    if(!req.body.username || !req.body.password) {
        return res.fail(400, "Mangler brugernavn eller kodeord.");
    }
    getAdminFromUsername(pool, req.body.username, (error, admin) => {
        if(error) {
            console.error("Failed to get admin from username " + req.body.username, error);
            return res.fail(500);
        }
        if(!admin) {
            return res.fail(400, "Brugernavn findes ikke.");
        }
        var hashedInputtedPassword = crypto.createHash("sha256").update(admin.salt + req.body.password).digest("hex");
        if(hashedInputtedPassword != admin.password) {
            return res.fail(400, "Forkert kodeord.");
        }
        req.session.username = req.body.username;
        req.session.password = req.body.password;
        if(req.query.then) {
            return res.redirect(req.query.then);
        }
        res.redirect("/admin");
    });
}

module.exports = function(pool) {
    return adminAuthEndpoint.bind(this, pool);
};
