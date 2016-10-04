var ensureFirstAdmin = require("./ensureFirstAdmin.js");
var path = require("path");
var fs = require("fs");
var renderView = require("../renderView.js");
var authenticate = require("./authenticate.js");

function adminEndpoint(pool, req, res) {
    authenticate(pool, req, res, (req, res) => {
        fs.readFile(path.join(__dirname, "adminView.html"), (error, buf) => {
            if(error) {
                console.error("Failed to read adminView", error);
                return res.fail(500);
            }
            renderView(buf.toString(), { admin: req.currentAdmin }, (error, result) => {
                if(error) {
                    console.error("failed to render adminView", error);
                    return res.fail(500);
                }
                res.send(result);
            });
        });
    });
}

module.exports = function(pool) {
    ensureFirstAdmin(pool);
    return adminEndpoint.bind(this, pool);
};
