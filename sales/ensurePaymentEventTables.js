var fs = require("fs");
var path = require("path");
var ensurePaymentStartedTableSql = fs.readFileSync(path.join(__dirname, "ensurePaymentStartedTable.sql")).toString();
var ensurePaymentFailedTableSql = fs.readFileSync(path.join(__dirname, "ensurePaymentFailedTable.sql")).toString();
var ensurePaymentCompletedTableSql = fs.readFileSync(path.join(__dirname, "ensurePaymentCompletedTable.sql")).toString();
var async = require("async");

function ensurePaymentEventTables(pool) {
    async.each([
        ensurePaymentStartedTableSql,
        ensurePaymentFailedTableSql,
        ensurePaymentCompletedTableSql
    ], (sql, callback) => {
        pool.query(sql, callback);
    }, (error) => {
        if(error) {
            console.error("Failed to ensure a payment event table!", error);
        }
    });
}

module.exports = ensurePaymentEventTables;
