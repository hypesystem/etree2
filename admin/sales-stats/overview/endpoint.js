var fs = require("fs");
var path = require("path");
var overviewView = fs.readFileSync(path.join(__dirname, "view.html")).toString();
var renderView = require("../../../renderView.js");

function overviewEndpoint(pool, req, res) {
    getSalesStatsOverview(pool, (error, viewModel) => {
        if(error) {
            console.error("Failed to get sales stats overview", error);
            return res.fail(500);
        }
        renderView(overviewView, viewModel, (error, view) => {
            if(error) {
                console.error("Failed to render overview view", error);
                return res.fail(500);
            }
            res.send(view);
        });
    });
}

function getSalesStatsOverview(pool, callback) {
    getPurchaseEvents(pool, (error, events) => {
        if(error) {
            return callback(error);
        }
        var revenue = 0;
        var sales = [];
        
        events.forEach(event => {
            if(event.type == "payment_completed") {
                revenue += event.data.amount;
            }
            
            // build sales objects
            if(event.type == "payment_started") {
                sales.push({
                    id: event.id,
                    state: "started",
                    last_state_change: event.happened_at.toISOString(),
                    customer_name: event.data.customerInfo.billingAddress.name,
                    customer_email: event.data.customerInfo.email,
                    amount: event.data.amount,
                    payment_started_data: JSON.stringify(event.data, null, 2)
                });
            }
            if(event.type == "payment_failed") {
                var sale = sales.find(sale => sale.id == event.id);
                if(!sale) {
                    console.error("Found a payment_failed record with no payment_started!", event);
                }
                sale.state = "failed";
                sale.last_state_change = event.happened_at.toISOString();
                sale.payment_failed_data = JSON.stringify(event.data, null, 2);
            }
            if(event.type == "payment_completed") {
                var sale = sales.find(sale => sale.id == event.id);
                if(!sale) {
                    console.error("Found a payment_completed record with no payment_started!", event);
                }
                sale.state = "completed";
                sale.last_state_change = event.happened_at.toISOString();
                sale.payment_completed_data = JSON.stringify(event.data, null, 2);
            }
        });
        
        sales.sort((a,b) => a.last_state_change > b.last_state_change ? -1 : 1); //desc
        
        callback(null, {
            revenue: revenue.toFixed(2),
            revenueAfterVat: (revenue * 0.8).toFixed(2),
            profit: "??.??", //tree + foot costs? bike rental?
            sales: sales
        });
    });
}

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

module.exports = function(pool) {
    return overviewEndpoint.bind(this, pool);
}