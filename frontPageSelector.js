var staticViewEndpoint = require("./staticViewEndpoint.js");

function frontPageSelector(req, res) {
    //TODO: On certain dates to certain things.
    if(req.query.forceState == "salesStarted") {
        var sales = staticViewEndpoint("sales/view.html");
        return sales(req, res);
    }
    
    var prelaunch = staticViewEndpoint("prelaunch/view.html");
    prelaunch(req, res);
}

module.exports = frontPageSelector;
