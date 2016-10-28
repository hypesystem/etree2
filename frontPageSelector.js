var staticViewEndpoint = require("./staticViewEndpoint.js");
var sales = staticViewEndpoint("sales/view.html", "sales/productData.json");
var downtime = staticViewEndpoint("downtime/view.html");
var prelaunch = staticViewEndpoint("prelaunch/view.html");

function frontPageSelector(req, res) {
    if(req.query.forceState == "salesStarted") {
        return sales(req, res);
    }
    if(req.query.forceState == "salesEnded") {
        return downtime(req, res);
    }
    if(req.query.forceState == "prelaunch") {
        return prelaunch(req, res);
    }
    
    var rn = new Date();
    var humanMonth = rn.getMonth() + 1;
    var humanDate = rn.getDate();
    
    //If we're after sale ends
    if(humanMonth >= 12 && humanDate >= 21) {
        return downtime(req, res);
    }
    
    //If we're after sale starts
    if(humanMonth >= 11) {
        return sales(req, res);
    }
    
    //If we're in or later than september
    if(humanMonth >= 9) {
        return prelaunch(req, res);
    }
    
    //Otherwise  (before september)  we're in downtime
    return downtime(req, res);
}

module.exports = frontPageSelector;
