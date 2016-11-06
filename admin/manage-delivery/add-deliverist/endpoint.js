var Events = require("../../../events/index.js");
var crypto = require("crypto");
var getDeliverists = require("../getDeliverists.js");
var uuid = require("uuid");

function addDeliveristEndpoint(events, req, res) {
    var username = req.body.username;
    if(!username || username == "") {
        return res.fail(400, "Missing username");
    }
    var name = req.body.name;
    if(!name || name == "") {
        return res.fail(400, "Missing name");
    }
    var password = req.body.password;
    if(!password || password == "") {
        return res.fail(400, "Missing password");
    }
    getDeliverists(events, (error, deliverists) => {
        if(error) {
            console.error("Failed to get deliverists", error);
            return res.fail(500);
        }
        var otherDeliveristUsernames = deliverists.map( x => x.username );
        if(otherDeliveristUsernames.includes(username)) {
            return res.fail(400, "Du kan ikke oprette en udbringer med et brugernavn der allerede er i brug (" + username + ")");
        }
        var salt = uuid.v4();
        var hashedInputtedPassword = crypto.createHash("sha256").update(salt + password).digest("hex");
        events.send("deliverist_created", {
            data: {
                username: username,
                name: name,
                password: hashedInputtedPassword,
                salt: salt
            }
        }, (error) => {
            if(error) {
                console.error("Failed to send deliverist created event", error);
                return res.fail(500);
            }
            res.redirect("/admin/delivery");
        });
    });
}

module.exports = function(events) {
    events.declare("deliverist_created");
    return addDeliveristEndpoint.bind(this, events);
};
