var getAdminFromUsername = require("./getAdminFromUsername.js");
var crypto = require("crypto");

function authenticate(pool, req, res, next) {
    if(!req.session.username || !req.session.password) {
        return res.redirect("/admin/login?then=" + req.originalUrl);
    }
    getAdminFromUsername(pool, req.session.username, (error, admin) => {
        if(error) {
            console.error("Failed to get admin from session username", req.session.username, error);
            return res.fail(500);
        }
        if(!admin) {
            req.session = null;
            return res.fail(401, "Din session var ikke gyldig (brugernavn). Logget ud.");
        }
        var hashedInputtedPassword = crypto.createHash("sha256").update(admin.salt + req.session.password).digest("hex");
        if(hashedInputtedPassword != admin.password) {
            req.session = null;
            return res.fail(401, "Din session var ikke gyldig (kodeord). Logget ud.");
        }
        req.currentAdmin = admin;
        next();
    });
}

module.exports = function(pool) {
    return authenticate.bind(this, pool);
};
