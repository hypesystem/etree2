var fs = require("fs");
var path = require("path");
var renderView = require("./renderView.js");

var previouslyRenderedStaticViews = {};

function staticViewEndpoint(view, viewModel) {
    return function(req, res) {
        var cachedResponse = previouslyRenderedStaticViews[view];
        if(cachedResponse) {
            return res.send(cachedResponse);
        }
        getStaticView(view, viewModel, (error, result) => {
            if(error) {
                console.error("Failed to render view " + view, error);
                return res.fail(500);
            }
            previouslyRenderedStaticViews[view] = result;
            res.send(result);
        });
    };
}

function getStaticView(view, viewModelPath, callback) {
    if(!viewModelPath) {
        return readAndRenderView(view, {}, callback);
    }
    fs.readFile(path.join(__dirname, viewModelPath), (error, buf) => {
        if(error) {
            return callback(error);
        }
        var viewModel = JSON.parse(buf.toString());
        readAndRenderView(view, viewModel, callback);
    })
}

function readAndRenderView(view, viewModel, callback) {
    fs.readFile(path.join(__dirname, view), function(error, buf) {
        if(error) {
            return callback(error);
        }
        renderView(buf.toString(), viewModel, function(error, result) {
            if(error) {
                return callback(error);
            }
            callback(null, result);
        });
    });
}

module.exports = staticViewEndpoint;
