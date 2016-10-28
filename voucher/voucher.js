var ensureVoucherTables = require("./ensureVoucherTables.js");

function voucher(pool) {
    ensureVoucherTables(pool); //create, use
    return {
        create: create.bind(this, pool),
        listActive: listActive.bind(this, pool),
        get: get.bind(this, pool),
        use: use.bind(this, pool)
    };
}

function create(pool, key, options, callback) {
    if(!options.rebate) {
        return callback(new Error("No rebate given in voucher created: " + key));
    }
    if(!options.name) {
        return callback(new Error("No name given in voucher created: " + key));
    }
    //expiry defaults to six months
    if(!options.expiry) {
        var expiry = new Date();
        var sixMonthsInDays = 6 * 30;
        expiry.setDate(expiry.getDate() + sixMonthsInDays);
        options.expiry = expiry.toISOString();
    }
    //multiuse default to false (only one use!)
    if(typeof options.multiuse == "undefined") {
        options.multiuse = false;
    }
    //default to no filters
    if(!options.filters) {
        options.filters = [];
    }
    if(!Array.isArray(options.filters)) {
        return callback(new Error("Invalidly formatted filters, must be array of strings"));
    }
    
    pool.query("SELECT * FROM voucher_created WHERE key = $1::text", [ key ], (error, result) => {
        if(error) {
            return callback(error);
        }
        if(result.rows.length) {
            return callback({
                type: "voucher_key_in_use",
                error: new Error("That voucher key is aready in use: " + key)
            });
        }
        pool.query("INSERT INTO voucher_created (key, data, happened_at) VALUES ($1::text, $2::json, $3::timestamp)", [
            key,
            JSON.stringify(options),
            new Date().toISOString()
        ], callback);
    });
}

function listActive(pool, callback) {
    //check which vouchers have not expired and have uses left
}

function get(pool, key, callback) {
    pool.query("SELECT * FROM voucher_created WHERE key=$1::text", [ key ], (error, result) => {
        if(error) {
            return callback(error);
        }
        var row = result.rows[0];
        if(!row) {
            return callback({
                type: "voucher_key_not_found",
                error: new Error("Could not find voucher with key " + key)
            });
        }
        var voucher = row.data;
        voucher.key = key;
        voucher.created_at = row.happened_at;
        voucher.active = new Date().toISOString() < row.data.expiry;
        pool.query("SELECT * FROM voucher_used WHERE key=$1::text", [ key ], (error, result) => {
            if(error) {
                return callback(error);
            }
            var row = result.rows[0];
            if(row) {
                voucher.active = false;
                voucher.used_at = row.happened_at;
            }
            callback(null, voucher);
        });
    });
}

function use(pool, key, callback) {
    get(pool, key, (error, voucher) => {
        if(error) {
            return callback(error);
        }
        if(!voucher.active) {
            return callback({
                type: "voucher_cannot_be_used",
                error: new Error("The voucher is not active, so cannot be used.")
            });
        }
        pool.query("INSERT INTO voucher_used (key, data, happened_at) VALUES ($1::text, $2::json, $3::timestamp)", [
            key,
            JSON.stringify({}),
            new Date().toISOString()
        ], (error) => {
            if(error) {
                return callback(error);
            }
            callback(null, voucher);
        });
    });
}

module.exports = voucher;
