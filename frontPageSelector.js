var staticViewEndpoint = require("./staticViewEndpoint.js");

function frontPageSelector(req, res) {
    //TODO: On certain dates to certain things.
    if(req.query.forceState == "salesStarted") {
        var sales = staticViewEndpoint("sales/view.html");
        return sales(req, res);
    }
    if(req.query.forceState == "salesEnded") {
        var downtime = staticViewEndpoint("downtime/view.html");
        return downtime(req, res);
    }
    
    var prelaunch = staticViewEndpoint("prelaunch/view.html");
    prelaunch(req, res);
}

module.exports = frontPageSelector;
