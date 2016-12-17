var fs = require("fs");
var path = require("path");
var overviewView = fs.readFileSync(path.join(__dirname, "view.html")).toString();
var renderView = require("../../../renderView.js");
var productData = require("../../../sales/productData.json");
var getPurchaseEvents = require("../getPurchaseEvents.js");

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
        var cost = 0;
        var deliveryIncome = 0;
        var numberOfTreesSold = 0;
        var numberOfFeetSold = 0;
        
        events.forEach(event => {
            // build sales objects
            if(event.type == "payment_started") {
                var productName = event.data.originalRequest["tree-size"];
                var product = productData.treeSizes.find(product => product.name == productName);
                var includeFoot = event.data.originalRequest["tree-foot"] == "yes";
                var includeDelivery = true;
                var saleCost = product.cost;
                if(includeFoot) {
                    saleCost += productData.footCost;
                }
                sales.push({
                    id: event.id,
                    state: "started",
                    last_state_change: event.happened_at.toISOString(),
                    customer_name: event.data.customerInfo.billingAddress.name,
                    customer_email: event.data.customerInfo.email,
                    amount: event.data.amount,
                    cost: saleCost,
                    withFoot: includeFoot,
                    withDelivery: includeDelivery,
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
            
            if(event.type == "payment_completed") {
                revenue += event.data.amount;
                numberOfTreesSold++;
                
                var sale = sales.find(sale => sale.id == event.id);
                if(!sale) {
                    console.error("Found a payment_completed record with no payment_started!", event);
                }
                cost += sale.cost;
                
                if(sale.withFoot) {
                    numberOfFeetSold++;
                }
                if(sale.withDelivery) {
                    deliveryIncome += productData.deliveryPrice;
                }
            }
        });
        
        sales.sort((a,b) => a.last_state_change > b.last_state_change ? -1 : 1); //desc
        
        var revenueAfterVat = revenue * 0.8;
        var deliveryBudget = (deliveryIncome * 0.8);
        callback(null, {
            revenue: revenue.toFixed(2),
            revenueAfterVat: revenueAfterVat.toFixed(2),
            cost: cost.toFixed(2),
            profit: (revenueAfterVat - cost - deliveryBudget).toFixed(2),
            deliveryIncome: deliveryBudget.toFixed(2),
            sales: sales,
            numberOfTreesSold: numberOfTreesSold,
            numberOfFeetSold: numberOfFeetSold
        });
    });
}

module.exports = function(pool) {
    return overviewEndpoint.bind(this, pool);
}
