var fs = require("fs");
var path = require("path");
var renderView = require("./renderView.js");

function staticViewEndpoint(view) {
    return function(req, res) {
        respondWithView(view, res);
    };
}

function respondWithView(view, res) {
    fs.readFile(path.join(__dirname, view), function(error, buf) {
        if(error) {
            console.error("Failed to read view " + view, error);
            return res.status(500).send(error500Page);
        }
        renderView(buf.toString(), function(error, result) {
            if(error) {
                console.error("Failed to render view " + view, error);
                return res.status(500).send(error500Page);
            }
            res.send(result);
        });
    });
}

module.exports = staticViewEndpoint;
