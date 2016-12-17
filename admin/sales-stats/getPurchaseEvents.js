function getPurchaseEvents(pool, callback) {
    pool.query("SELECT * FROM payment_started ORDER BY happened_at ASC", (error, startedResult) => {
        if(error) {
            return callback(error);
        }
        pool.query("SELECT * FROM payment_failed ORDER BY happened_at ASC", (error, failedResult) => {
            if(error) {
                return callback(error);
            }
            pool.query("SELECT * FROM payment_completed ORDER BY happened_at ASC", (error, completedResult) => {
                if(error) {
                    return callback(error);
                }
                startedEvents = startedResult.rows;
                startedEvents.forEach(x => x.type = "payment_started");
                failedEvents = failedResult.rows;
                failedEvents.forEach(x => x.type = "payment_failed");
                completedEvents = completedResult.rows;
                completedEvents.forEach(x => x.type = "payment_completed");
                var events = [].concat(startedEvents).concat(failedEvents).concat(completedEvents);
                events.sort((a, b) => (a.happened_at < b.happened_at) ? -1 : 1); //asc
                callback(null, events);
            });
        });
    });
}

module.exports = getPurchaseEvents;
