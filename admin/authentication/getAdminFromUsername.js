var getAdmins = require("../getAdmins.js");

function getAdminFromUsername(pool, username, callback) {
    getAdmins(pool, (error, admins) => {
        if(error) {
            return callback(error);
        }
        var admin = admins.find(admin => {
            return admin.username == username;
        });
        callback(null, admin);
    });
}

module.exports = getAdminFromUsername;
