var fs = require("fs");
var path = require("path");
var frontmatter = require("frontmatter");
var mustache = require("mustache");

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

function renderView(view, callback) {
    var page = frontmatter(view);
    if(!page.data || !page.data.layout) {
        return callback(null, view);
    }
    var layoutPath = path.join(__dirname, "layouts", page.data.layout + ".html");
    fs.readFile(layoutPath, function(error, layoutBuf) {
        if(error) {
            return callback(error);
        }
        var merged = mustache.render(layoutBuf.toString(), { content: page.content });
        renderView(merged, callback);
    });
}

module.exports = staticViewEndpoint;
