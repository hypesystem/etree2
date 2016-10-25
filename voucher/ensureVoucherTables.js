var fs = require("fs");
var path = require("path");
var ensureVoucherCreatedTableSql = fs.readFileSync(path.join(__dirname, "ensureVoucherCreatedTable.sql")).toString();
var ensureVoucherUsedTableSql = fs.readFileSync(path.join(__dirname, "ensureVoucherUsedTable.sql")).toString();
var async = require("async");

function ensureVoucherTables(pool) {
    async.each([
        ensureVoucherCreatedTableSql,
        ensureVoucherUsedTableSql
    ], (sql, callback) => {
        pool.query(sql, callback);
    }, (error) => {
        if(error) {
            console.error("Failed to ensure voucher tables", error);
        }
    });
}

module.exports = ensureVoucherTables;
