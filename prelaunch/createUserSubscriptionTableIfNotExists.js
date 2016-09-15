var fs = require("fs");
var path = require("path");
var sql = fs.readFileSync(path.join(__dirname, "create_table_if_not_exists.sql")).toString();

function createTableIfNotExists(pool) {
    pool.query(sql, (error, result) => {
        if(error) {
            return console.error("Failed to ensure existence of prelaunch events table", error);
        }
    });
}

module.exports = createTableIfNotExists;
