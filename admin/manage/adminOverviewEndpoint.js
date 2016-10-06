var getAdmins = require("../getAdmins.js");
var fs = require("fs");
var path = require("path");
var renderView = require("../../renderView.js");

function adminOverviewEndpoint(pool, req, res) {
    getAdmins(pool, (error, admins) => {
        if(error) {
            console.error("Failed to get admins", error);
            return res.fail(500);
        }
        fs.readFile(path.join(__dirname, "overview.html"), (error, buf) => {
            if(error) {
                console.error("Failed to read admin management overview file", error);
                return res.fail(500);
            }
            renderView(buf.toString(), { admins: admins }, (error, result) => {
                if(error) {
                    console.error("Failed to render admin view", error);
                    return res.fail(500);
                }
                res.send(result);
            });
        });
    });
}

module.exports = function(pool) {
    return adminOverviewEndpoint.bind(this, pool);
};
