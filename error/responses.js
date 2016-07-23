var fs = require("fs");
var path = require("path");

module.exports = {
    404: readFileForError(404),
    500: readFileForError(500)
};

function readFileForError(error) {
    return fs.readFileSync(path.join(__dirname, error + ".html"));
}
