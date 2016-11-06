function getDeliverists(events, callback) {
    events.project([ "deliverist_created", "deliverist_deleted", "deliverist_updated" ], "deliverist", (event, picker, callback) => {
        if(event.type == "deliverist_deleted") {
            return picker(event.id, (state, saver) => {
                state.deleted = true;
                state.deleted_at = event.happened_at;
                saver(state);
                callback();
            });
        }
        if(event.type == "deliverist_updated") {
            return picker(event.id, (state, saver) => {
                state.username = event.username;
                state.name = event.name;
                saver(state);
                callback();
            });
        }
        event.created_at = event.happened_at;
        delete event.happened_at;
        delete event.type;
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
        callback(null, result.filter(x => !x.deleted));
    });
}

module.exports = getDeliverists;
