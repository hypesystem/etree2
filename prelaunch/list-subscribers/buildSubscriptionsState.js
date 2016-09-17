function buildSubscriptionsState(pool, callback) {
    pool.query("SELECT * FROM user_signed_up_for_newsletter", (error, result) => {
        if(error) {
            console.error("[getActiveSubscriptions] Failed to get subscription list", error);
            return callback(error);
        }
        var subscriptionContents = result.rows.map(row => {
            return {
                id: row.id,
                email: row.data.email
            };
        });
        pool.query("SELECT * FROM user_unsubscribed_from_newsletter", (error, result) => {
            if(error) {
                console.error("[getActiveSubscriptions] Failed to check who has unsubscribed for subscriber list", error);
                return callback(error);
            }
            var unsubscribedEmails = result.rows.map(row => {
                var match = subscriptionContents.filter(subscription => subscription.id == row.id)[0];
                return match ? match.email : null;
            });
            var alreadyIncludedEmails = [];
            subscriptionContents = subscriptionContents.filter((subscription, index) => {
                if(unsubscribedEmails.indexOf(subscription.email) != -1) {
                    return false;
                }
                if(alreadyIncludedEmails.indexOf(subscription.email) != -1) {
                    return false;
                }
                alreadyIncludedEmails.push(subscription.email);
                return true;
            });
            callback(null, subscriptionContents);
        });
    });
}

module.exports = buildSubscriptionsState;
