var fs = require("fs");
var path = require("path");
var renderView = require("./renderView.js");

var previouslyRenderedStaticViews = {};

function staticViewEndpoint(view) {
    return function(req, res) {
        var cachedResponse = previouslyRenderedStaticViews[view];
        if(cachedResponse) {
            return res.send(cachedResponse);
        }
        getStaticView(view, (error, result) => {
            if(error) {
                console.error("Failed to render view " + view, error);
                return res.fail(500);
            }
            previouslyRenderedStaticViews[view] = result;
            res.send(result);
        });
    };
}

function getStaticView(view, callback) {
    fs.readFile(path.join(__dirname, view), function(error, buf) {
        if(error) {
            return callback(error);
        }
        renderView(buf.toString(), function(error, result) {
            if(error) {
                return callback(error);
            }
            callback(null, result);
        });
    });
}

module.exports = staticViewEndpoint;
