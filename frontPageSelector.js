var staticViewEndpoint = require("./staticViewEndpoint.js");
var sales = staticViewEndpoint("sales/view.html", "sales/productData.json");
var downtime = staticViewEndpoint("downtime/view.html");
var prelaunch = staticViewEndpoint("prelaunch/view.html");

function frontPageSelector(req, res) {
    //TODO: On certain dates to certain things.
    if(req.query.forceState == "salesStarted") {
        return sales(req, res);
    }
    if(req.query.forceState == "salesEnded") {
        return downtime(req, res);
    }
    
    prelaunch(req, res);
}

module.exports = frontPageSelector;
