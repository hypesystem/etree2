var fs = require("fs");
var path = require("path");
var mustache = require("mustache");
var renderView = require("../renderView.js");

var errorResponses = {};

[
    400,
    404,
    500
].forEach(function(errorCode) {
    fs.readFile(path.join(__dirname, errorCode + ".html"), function(error, errorFileBuf) {
        if(error) {
            console.error("Failed to read error file for " + errorCode, error);
            return process.exit(1);
        }
        errorResponses[errorCode] = function(res, message) {
            if(!message) {
                message = null;
            }
            var personalizedView = mustache.render(errorFileBuf.toString(), { message: message });
            renderView(personalizedView, function(error, response) {
                if(error) {
                    console.error("Failed to render error page for error code " + errorCode, error);
                    return process.exit(1);
                }
                res.status(errorCode).send(response);
            });
        };
    });
});

module.exports = errorResponses;
