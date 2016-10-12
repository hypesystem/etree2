function getAdmins(pool, callback) {
    pool.query("SELECT * FROM admin_created", (error, result) => {
        if(error) {
            return callback(error);
        }
        var adminsById = {};
        result.rows.forEach(row => {
            var result = row.data;
            result.id = row.id;
            result.created_at = row.happened_at;
            result.last_updated = row.happened_at;
            adminsById[result.id] = result;
        });
        pool.query("SELECT * FROM admin_updated ORDER BY happened_at ASC", (error, result) => {
            if(error) {
                return callback(error);
            }
            result.rows.forEach(row => {
                var result = adminsById[row.id];
                result.last_updated = row.happened_at;
                var updatedData = row.data;
                Object.keys(updatedData).forEach(key => {
                    if(["id", "created_at", "last_updated"].includes(key)) {
                        console.error("When building admin projection, ignored key " + key + "!! Should not have existed...");
                        return;
                    }
                    result[key] = updatedData[key];
                });
            });
            var admins = [];
            Object.keys(adminsById).forEach(key => {
                admins.push(adminsById[key]);
            });
            callback(null, admins);
        });
    });
}

module.exports = getAdmins;
