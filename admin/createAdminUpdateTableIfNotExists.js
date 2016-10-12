var fs = require("fs");
var path = require("path");
var createAdminUpdateTableIfNotExists = fs.readFileSync(path.join(__dirname, "createAdminUpdateTableIfNotExists.sql")).toString();

function createTableIfNotExists(pool, callback) {
    pool.query(createAdminUpdateTableIfNotExists, (error, result) => {
        if(error) {
            console.error("Failed to ensure existence of admin_created events table", error);
            return callback(error);
        }
        callback();
    });
}

module.exports = createTableIfNotExists;
