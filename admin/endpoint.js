var staticViewEndpoint = require("../staticViewEndpoint.js");
var loginView = staticViewEndpoint("admin/loginView.html");
var ensureFirstAdmin = require("./ensureFirstAdmin.js");
var renderView = require("../renderView.js");
var getAdminFromUsername = require("./getAdminFromUsername.js");
var crypto = require("crypto");
var path = require("path");
var fs = require("fs");
var renderView = require("../renderView.js");

function adminEndpoint(pool, req, res) {
    if(!req.session.username || !req.session.password) {
        return loginView(req, res);
    }
    getAdminFromUsername(pool, req.session.username, (error, admin) => {
        if(error) {
            console.error("Failed to get admin from session username", req.session.username);
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
        fs.readFile(path.join(__dirname, "adminView.html"), (error, buf) => {
            if(error) {
                console.error("Failed to read adminView", error);
                return res.fail(500);
            }
            renderView(buf.toString(), { admin: admin }, (error, result) => {
                if(error) {
                    console.error("failed to render adminView", error);
                    return res.fail(500);
                }
                res.send(result);
            });
        });
    });
}

module.exports = function(pool) {
    ensureFirstAdmin(pool);
    return adminEndpoint.bind(this, pool);
};
