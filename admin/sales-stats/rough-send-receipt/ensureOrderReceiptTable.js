var fs = require("fs");
var path = require("path");
var ensureOrderReceivedReceiptSentTableSql = fs.readFileSync(path.join(__dirname, "ensureOrderReceivedReceiptSentTable.sql")).toString();
var async = require("async");

function ensureOrderReceiptTable(pool) {
    async.each([
        ensureOrderReceivedReceiptSentTableSql
    ], (sql, callback) => {
        pool.query(sql, callback);
    }, (error) => {
        if(error) {
            console.error("Failed to ensure a payment event table!", error);
        }
    });
}

module.exports = ensureOrderReceiptTable;
