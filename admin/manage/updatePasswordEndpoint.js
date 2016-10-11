var fs = require("fs");
var path = require("path");
var updateAdminSql = fs.readFileSync(path.join(__dirname, "updateAdmin.sql"));
var uuid = require("uuid");
var crypto = require("crypto");

function updatePasswordEndpoint(pool, req, res) {
    if(!req.body.password || req.body.password == "") {
        return res.fail(400, "Du mangler at udfylde et password, du vil skifte til.");
    }
    var salt = uuid.v4();
    var hashedInputtedPassword = crypto.createHash("sha256").update(salt + req.body.password).digest("hex");
    pool.query(updateAdminSql, [
        req.currentAdmin.id,
        JSON.stringify({ salt: salt, password: hashedInputtedPassword }),
        new Date().toISOString()
    ], error => {
        if(error) {
            console.error("Failed to update password for " + currentAdmin.username + "/" + currentAdmin.id + " (insert event failed)", error);
            return res.fail(500);
        }
        res.redirect("/admin/manage");
    });
}

module.exports = function(pool) {
    return updatePasswordEndpoint.bind(this, pool);
};
