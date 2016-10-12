var getAdmins = require("../getAdmins.js");
var fs = require("fs");
var path = require("path");
var updateAdminSql = fs.readFileSync(path.join(__dirname, "updateAdmin.sql")).toString();

function updateAdminEndpoint(pool, req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var username = req.body.username;
    if(!id) {
        return res.fail(400, "Du mangler at udfylde et gyldigt admin id.");
    }
    if(!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return res.fail(400, "Admin ID'et du udfyldte er ikke gyldigt.");
    }
    if(!name || name.length == 0) {
        return res.fail(400, "Du mangler at udfylde et navn");
    }
    if(!username) {
        return res.fail(400, "Du mangler et brugernavn, du vil skifte til");
    }
    if(username.length < 3) {
        return res.fail(400, "Dit brugernavn skal være mindst 3 karakterer");
    }
    getAdmins(pool, (error, admins) => {
        if(error) {
            console.error("Failed to get admins", error);
            return res.fail(500);
        }
        var otherUsersUsernames = admins.filter(admin => admin.id != req.body.id).map(admin => admin.username);
        if(otherUsersUsernames.includes(username)) {
            return res.fail(400, "Du kan ikke skifte til et brugernavn der allerede er i brug.");
        }
        pool.query(updateAdminSql, [
            id,
            JSON.stringify({ name: name, username: username }),
            new Date().toISOString()
        ], (error) => {
            if(error) {
                console.error("Failed to update info for admin " + id + " (insert event failed)", error);
                return res.fail(500);
            }
            res.redirect("/admin/manage");
        });
    });
}

module.exports = function(pool) {
    return updateAdminEndpoint.bind(this, pool);
};
