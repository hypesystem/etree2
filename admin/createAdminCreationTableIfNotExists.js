var fs = require("fs");
var path = require("path");
var createAdminCreationTableIfNotExists = fs.readFileSync(path.join(__dirname, "createAdminCreationTableIfNotExists.sql")).toString();

function createTableIfNotExists(pool, callback) {
    pool.query(createAdminCreationTableIfNotExists, (error, result) => {
        if(error) {
            console.error("Failed to ensure existence of admin_created events table", error);
            return callback(error);
        }
        callback();
    });
}

module.exports = createTableIfNotExists;
