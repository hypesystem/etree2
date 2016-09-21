var staticViewEndpoint = require("./staticViewEndpoint.js");

function frontPageSelector(req, res) {
    var prelaunch = staticViewEndpoint("prelaunch/view.html");
    prelaunch(req, res);
}

module.exports = frontPageSelector;
