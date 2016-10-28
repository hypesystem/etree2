var getActiveSubscriptions = require("../../admin/list-subscribers/getActiveSubscriptions.js");
var Vouchers = require("../../voucher/voucher.js");

/**
 * This is a bit of an odd script, added because we are introducing vouchers,
 * created when a user signs up for the newsletter. For all the users who have
 * already signed up, we need to create the vouchers on deploy.
 * Doing things *once* is **HARD**!
 */
function ensureSubscriberVouchers2016(pool) {
    getActiveSubscriptions(pool, (error, subscribers) => {
        if(error) {
            return console.error("Failed to get active subscribers when ensuring subscriber vouchers 2016", error);
        }
        if(subscribers.length == 0) {
            return console.log("No subscribers found, no need to create 2016 vouchers.");
        }
        var vouchers = Vouchers(pool);
        //Check if we have already done this
        vouchers.get("2016-" + subscribers[0].id, (error) => {
            if(error && error.type == "voucher_key_not_found") {
                return createVouchersForSubscribers(vouchers, subscribers);
            }
            if(error) {
                return console.error("Failed to get voucher to check if we had already ensured vouchers")
            }
            return console.log("Already ensured 2016 vouchers.");
        });
    });
}

function createVouchersForSubscribers(vouchers, subscribers) {
    var year = new Date().getFullYear();
    subscribers.forEach((subscriber) => {
        vouchers.create(year + "-" + subscriber.id, {
            name: "15% rabat på levering",
            rebate: 15,
            filters: [ "delivery" ]
        }, (error) => {
            if(error) {
                console.error("Failed to create 2016 voucher for " + subscriber.id, error);
            }
        });
    });
}

module.exports = ensureSubscriberVouchers2016;
