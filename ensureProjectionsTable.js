var fs = require("fs");
var path = require("path");
var sql = fs.readFileSync(path.join(__dirname, "ensureProjectionsTable.sql")).toString();

function createTableIfNotExists(pool) {
    pool.query(sql, (error, result) => {
        if(error) {
            return console.error("Failed to ensure existence of projections table", error);
        }
    });
}

module.exports = createTableIfNotExists;
