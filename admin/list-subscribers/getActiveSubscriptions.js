var fs = require("fs");
var path = require("path");
var buildSubscriptionsState = require("./buildSubscriptionsState.js");
var getCurrentStateAndLastEventTimestamp = fs.readFileSync(path.join(__dirname, "getCurrentStateAndLastEventTimestamp.sql")).toString();
var updateSubscriptionsProjectionIfExists = fs.readFileSync(path.join(__dirname, "updateSubscriptionsProjectionIfExists.sql")).toString();

function getActiveSubscriptions(pool, callback) {
    pool.query(getCurrentStateAndLastEventTimestamp, (error, result) => {
        if(error) {
            return callback(error);
        }
        result = result.rows[0];
        if(!result) {
            return callback(new Error("Empty result returned when trying to get last state and event timestamp"));
        }
        if(result.last_subscribe_happened_at <= result.last_projection_update_at && result.last_unsubscribe_happened_at <= result.last_projection_update_at) {
            return callback(null, result.state);
        }
        buildSubscriptionsState(pool, (error, state) => {
            if(error) {
                return callback(error);
            }
            pool.query(updateSubscriptionsProjectionIfExists, [JSON.stringify(state), new Date().toISOString()], (error) => {
                if(error) {
                    return callback(error);
                }
                callback(null, state);
            });
        });
    });
}

module.exports = getActiveSubscriptions;
