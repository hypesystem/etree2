var getDeliverists = require("../getDeliverists.js");
var crypto = require("crypto");

function updateDeliveristEndpoint(events, req, res) {
    var id = req.params.id;
    if(!id) {
        return res.fail(400, "No deliverist id to update");
    }
    var username = req.body.username;
    var name = req.body.name;
    var password = req.body.password;
    getDeliverists(events, (error, deliverists) => {
        if(error) {
            console.error("Failed to get deliverists", error);
            return res.fail(500);
        }
        var deliverist = deliverists.find(x => x.id == id);
        if(!deliverist) {
            return res.fail(400, "Invalid deliverist id to update");
        }
        var updateData = {};
        if(username && username != "") {
            updateData.username = username;
        }
        if(name && name != "") {
            updateData.name = name;
        }
        if(password && password != "") {
            var salt = uuid.v4();
            var hashedInputtedPassword = crypto.createHash("sha256").update(salt + password).digest("hex");
            updateData.password = hashedInputtedPassword;
            updateData.salt = salt;
        }
        events.send("deliverist_updated", {
            identifier: id,
            data: updateData
        }, (error) => {
            if(error) {
                console.error("Failed to send deliverist_updated event", error);
                return res.fail(500);
            }
            res.redirect("/admin/delivery");
        });
    });
}

module.exports = function(events) {
    events.declare("deliverist_updated");
    return updateDeliveristEndpoint.bind(this, events);
};
