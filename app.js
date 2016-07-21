var express = require("express");
var fs = require("fs");
var path = require("path");

var error404Page = fs.readFileSync(path.join(__dirname, "error/404.html")).toString();
var error500Page = fs.readFileSync(path.join(__dirname, "error/500.html")).toString();

var app = express();

app.get("/", function(req, res) {
    fs.readFile(path.join(__dirname, "prelaunch/view.html"), function(error, buf) {
        if(error) {
            console.error("Failed to read prelaunch view", error);
            return res.status(500).send(error500Page);
        }
        res.send(buf.toString());
    });
});

app.post("/subscribe", function(req, res) {
    
});

app.use(function endpointNotFound(req, res) {
    res.status(404).send(error404Page);
});

app.listen(3000);
