var uuid = require("uuid");
var getAdmins = require("../getAdmins.js");
var fs = require("fs");
var path = require("path");
var insertAdminSql = fs.readFileSync(path.join(__dirname, "insertAdmin.sql")).toString();
var crypto = require("crypto");

function createAdminEndpoint(pool, req, res) {
    var id = uuid.v4();
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    if(!name || name.length == 0) {
        return res.fail(400, "Du mangler at udfylde et navn");
    }
    if(!username) {
        return res.fail(400, "Du mangler et brugernavn, du vil skifte til");
    }
    if(username.length < 3) {
        return res.fail(400, "Dit brugernavn skal være mindst 3 karakterer");
    }
    if(!password) {
        return res.fail(400, "Du mangler at angive et ønsket kodeord");
    }
    getAdmins(pool, (error, admins) => {
        if(error) {
            console.error("Failed to get admins", error);
            return res.fail(500);
        }
        var otherUsersUsernames = admins.map(admin => admin.username);
        if(otherUsersUsernames.includes(username)) {
            return res.fail(400, "Du kan ikke skifte til et brugernavn der allerede er i brug.");
        }
        var salt = uuid.v4();
        var hashedInputtedPassword = crypto.createHash("sha256").update(salt + req.body.password).digest("hex");
        pool.query(insertAdminSql, [
            id,
            JSON.stringify({
                name: name,
                username: username,
                salt: salt,
                password: hashedInputtedPassword
            }),
            new Date().toISOString()
        ], (error) => {
            if(error) {
                console.error("Failed to insert new admin " + username + "/" + id + " (insert event failed)", error);
                return res.fail(500);
            }
            res.redirect("/admin/manage");
        });
    });
}

module.exports = function(pool) {
    return createAdminEndpoint.bind(this, pool);
};
