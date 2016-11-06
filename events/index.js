var fs = require("fs");
var path = require("path");
var ensureEventTableWithDataSql = fs.readFileSync(path.join(__dirname, "ensureEventTableWithData.sql")).toString();
var ensureEventTableWithoutDataSql = fs.readFileSync(path.join(__dirname, "ensureEventTableWithoutData.sql")).toString();
var createEventEntryWithDataSql = fs.readFileSync(path.join(__dirname, "createEventEntryWithData.sql")).toString();
var createEventEntryWithoutDataSql = fs.readFileSync(path.join(__dirname, "createEventEntryWithoutData.sql")).toString();
var async = require("async");
var uuid = require("uuid");

//TODO: ensure that database calls happen in-order, so several declares can happen
//  and they happen in correct order. If a project call happens it should happen
//  after the declares queued before.
//TODO: for each db call do exponential backoff 5 retries if it fails, then log
//      failure and add to error queue or something. Then try the rest.

function Events(pool) {
    var eventTypes = [];
    
    return {
        declare: (name, options) => declare(pool, eventTypes, name, options),
        send: (type, data, callback) => send(pool, eventTypes, type, data, callback),
        project: (sourceEventTypes, projectionType, projector, callback) => project(pool, eventTypes, sourceEventTypes, projectionType, projector, callback),
        projection: {
            get: (type, identifier, callback) => getProjection(pool, type, identifier, callback)
        }
    };
}

function declare(pool, eventTypes, name, options) {
    options = options || {};
    if(!options.identifier) {
        options.identifier = {
            name: "id",
            datatype: "uuid"
        };
    }
    if(typeof options.includeData == "undefined") {
        options.includeData = true;
    }
    options.type = name;
    var sql = options.includeData ? ensureEventTableWithDataSql : ensureEventTableWithoutDataSql;
    //TODO: replace replaces here with mustache render?
    sql = sql.replace(/\{\{table_name\}\}/g, name);
    sql = sql.replace(/\{\{identifier_name\}\}/g, options.identifier.name);
    sql = sql.replace(/\{\{identifier_type\}\}/g, options.identifier.datatype);
    pool.query(sql, (error) => {
        if(error) {
            return console.error("Failed to ensure " + name + " event table", error);
        }
        //TODO: what if the event type changes and should no longer have data or similar? Versioning of some sort?
        eventTypes.push(options);
    });
}

function send(pool, eventTypes, type, options, callback) {
    if(!callback) {
        callback = options;
        options = {};
    }
    var data = options.data || {};
    var identifier = options.identifier || uuid.v4();
    
    var eventType = eventTypes.find(x => x.type == type);
    if(!eventType) {
        return callback(new Error("Unknown event type name " + type + ", cannot send event."));
    }
    console.log("Sending to event type", eventType);
    if(eventType.includeData) {
        var sql = createEventEntryWithDataSql;
        sql = sql.replace(/\{\{table_name\}\}/g, type);
        sql = sql.replace(/\{\{identifier_name\}\}/g, eventType.identifier.name);
        sql = sql.replace(/\{\{identifier_type\}\}/g, eventType.identifier.datatype);
        return pool.query(sql, [
            identifier,
            JSON.stringify(data),
            new Date().toISOString()
        ], callback);
    }
    var sql = createEventEntryWithoutDataSql;
    sql = sql.replace(/\{\{table_name\}\}/g, type);
    sql = sql.replace(/\{\{identifier_name\}\}/g, eventType.identifier.name);
    sql = sql.replace(/\{\{identifier_type\}\}/g, eventType.identifier.datatype);
    pool.query(sql, [
        identifier,
        new Date().toISOString()
    ], callback);
}

function project(pool, eventTypes, sourceEventTypes, projectionType, projector, callback) {
    //TODO: if projection is already set up, skip!
    //      basically all the performance enhancement (caching etc) is yet to be done
    //TODO: except if this is a new projector. Test by saving a projectorHash in db.
    //      in that case, rerun all projections of this type.
    if(!Array.isArray(sourceEventTypes)) {
        sourceEventTypes = [ sourceEventTypes ];
    }
    async.map(sourceEventTypes, (sourceEventType, next) => {
        var eventType = eventTypes.find(x => x.type == sourceEventType);
        if(!eventType) {
            return next(new Error("Attempting to project from unknown event type " + sourceEventType));
        }
        pool.query("SELECT * FROM " + sourceEventType, (error, result) => {
            if(error) {
                return next(error);
            }
            var events = result.rows.map(row => {
                var data = row.data || {};
                data.type = sourceEventType;
                data[eventType.identifier.name] = row[eventType.identifier.name];
                data.happened_at = row.happened_at;
                return data;
            });
            next(null, events);
        });
    }, (error, eventCollections) => {
        if(error) {
            return callback(error);
        }
        var events = eventCollections.reduce((a,b) => a.concat(b));
        events.sort((a,b) => a.happened_at < b.happened_at ? -1 : 1);
        var projections = {};
        async.each(events, (event, next) => {
            projector(event, (identifier, pickerCallback) => {
                if(error) {
                    return next(error);
                }
                //TODO: instead of passing current projection state directly, pass a copy (avoid modification)
                pickerCallback(projections[identifier] || {}, (data) => {
                    projections[identifier] = data;
                });
            }, next);
        }, (error) => {
            //TODO: register getter for projection; ensure projection is built as few times as possible
            //      maybe by continuing from last projection if new events happened?
            if(error) {
                return callback(error);
            }
            //TODO: Actually save projections
            callback(null, projections);
        });
    });
}

/*
//This is how sample code would look. Ughh it is a bit messy!! Naming is a bit confusing, too.
events.project("payment_started", "purchase", (event, picker, callback) => {
    //validate event
    var id = event.id;
    
    //get current state for a projection
    picker(id, (projection, saver) => {
        //modify state
        projection.data = event.data;
        
        //return to collection
        saver(projection);
        
        //indicate projecting from this event has concluded
        callback();
    });
}, (error) => {
    //final callback: did the projecting succeed?
    console.log("..?");
});
*/

function getProjection(pool, type, identifier, callback) {
    
}

module.exports = Events;
