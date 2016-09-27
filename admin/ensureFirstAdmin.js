var fs = require("fs");
var path = require("path");
var createAdminCreationTableIfNotExists = require("./createAdminCreationTableIfNotExists.js");
var insertFirstAdminIfNotExists = fs.readFileSync(path.join(__dirname, "insertFirstAdminIfNotExists.sql")).toString();
var updateFirstAdminIfExists = fs.readFileSync(path.join(__dirname, "updateFirstAdminIfExists.sql")).toString();

function ensureFirstAdmin(pool) {
    createAdminCreationTableIfNotExists(pool, (error) => {
        if(error) {
            return console.error("Failed to create admin creation table if not exists", error);
        }
        var state = {
            name: "Admin Adminsson",
            username: "admin",
            salt: "ac6dbc68-88e3-4676-a694-18cf58c01646",
            password: "73b557de7424f6e63aab418135fca6eed1f80be29a7a7ecdc83850311a64ac03"
        };
        var fields = [ JSON.stringify(state), new Date().toISOString() ];
        pool.query(insertFirstAdminIfNotExists, fields, (error) => {
            if(error) {
                console.error("Insert first admin failed", error);
            }
            pool.query(updateFirstAdminIfExists, fields, (error) => {
                if(error) {
                    console.error("Update first admin failed", error);
                }
            });
        });
    });
}

module.exports = ensureFirstAdmin;
