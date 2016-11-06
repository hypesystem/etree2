var getDeliverists = require("../getDeliverists.js");

function deleteDeliveristEndpoint(events, req, res) {
    var id = req.params.id;
    if(!id) {
        return res.fail(400, "Missing id to delete");
    }
    getDeliverists(events, (error, deliverists) => {
        if(error) {
            console.error("failed to get deliverists", error);
            return res.fail(500);
        }
        var deliverist = deliverists.find(x => x.id == id);
        if(!deliverist) {
            return res.fail(400, "Invalid deliverist id nonexist");
        }
        events.send("deliverist_deleted", { identifier: id }, (error) => {
            if(error) {
                console.error("Failed to send deliverist deleted event", error);
                return res.fail(500);
            }
            res.redirect("/admin/delivery");
        });
    });
}

module.exports = function(events) {
    events.declare("deliverist_deleted", { includeData: false });
    return deleteDeliveristEndpoint.bind(this, events);
};
