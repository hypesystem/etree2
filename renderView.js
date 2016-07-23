var fs = require("fs");
var path = require("path");
var frontmatter = require("frontmatter");
var mustache = require("mustache");

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

module.exports = renderView;
