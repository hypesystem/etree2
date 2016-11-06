function getDeliverists(events, callback) {
    events.project("deliverist_created", "deliverist", (event, picker, callback) => {
        event.created_at = event.happened_at;
        delete event.happened_at;
        picker(event.id, (state, saver) => {
            saver(event);
            callback();
        });
    }, (error, projections) => {
        if(error) {
            return callback(error);
        }
        var result = [];
        Object.keys(projections).forEach(id => {
            result.push(projections[id]);
        });
        callback(null, result);
    });
}

module.exports = getDeliverists;
