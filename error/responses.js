var fs = require("fs");
var path = require("path");
var mustache = require("mustache");

module.exports = {
    400: getErrorFunction(400),
    404: readFileForError(404),
    500: readFileForError(500)
};

function getErrorFunction(error) {
    var errorFile = readFileForError(error);
    return function(message) {
        return mustache.render(errorFile, { message: message });
    }
}

function readFileForError(error) {
    return fs.readFileSync(path.join(__dirname, error + ".html")).toString();
}
