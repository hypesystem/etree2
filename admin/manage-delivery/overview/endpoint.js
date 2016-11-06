var getDeliverists = require("../getDeliverists.js");
var fs = require("fs");
var path = require("path");
var overviewView = fs.readFileSync(path.join(__dirname, "view.html")).toString();
var renderView = require("../../../renderView.js");
var Events = require("../../../events/index.js");

function deliveryOverviewEndpoint(events, req, res) {
    getDeliverists(events, (error, deliverists) => {
        if(error) {
            console.error("Failed to get deliverists", error);
            return res.fail(500);
        }
        renderView(overviewView, { deliverists: deliverists }, (error, result) => {
            if(error) {
                console.error("Failed to render delivery view", error);
                return res.fail(500);
            }
            res.send(result);
        });
    });
}

module.exports = function(events) {
    return deliveryOverviewEndpoint.bind(this, events);
};
