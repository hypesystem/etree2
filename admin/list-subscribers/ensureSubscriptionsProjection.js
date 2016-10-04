var fs = require("fs");
var path = require("path");
var insertSubscriptionsProjectionIfNotExists = fs.readFileSync(path.join(__dirname, "insertSubscriptionsProjectionIfNotExists.sql")).toString();
var updateSubscriptionsProjectionIfExists = fs.readFileSync(path.join(__dirname, "updateSubscriptionsProjectionIfExists.sql")).toString();
var buildSubscriptionsState = require("./buildSubscriptionsState.js");

function ensureSubscriptionsProjection(pool) {
    buildSubscriptionsState(pool, (error, state) => {
        if(error) {
            return console.error("Failed to build subscriptions projection at launch :-(", error);
        }
        ensureSubscriptionProjectionWithState(pool, state, (error) => {
            if(error) {
                return console.error("Failed to save subscriptions projection at launch :-(", error);
            }
        });
    });
}

function ensureSubscriptionProjectionWithState(pool, state, callback) {
    pool.query(insertSubscriptionsProjectionIfNotExists, [JSON.stringify(state), new Date().toISOString()], (error) => {
        if(error) {
            console.error("Insert subscriptions projection failed");
            return callback(error);
        }
        pool.query(updateSubscriptionsProjectionIfExists, [JSON.stringify(state), new Date().toISOString()], (error) => {
            if(error) {
                console.error("Update subscriptions projection failed");
                return callback(error);
            }
            callback();
        });
    });
}

module.exports = ensureSubscriptionsProjection;
