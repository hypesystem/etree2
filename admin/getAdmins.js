function getAdmins(pool, callback) {
    pool.query("SELECT * FROM admin_created", (error, result) => {
        if(error) {
            return callback(error);
        }
        callback(null, result.rows.map(row => {
            var result = row.data;
            result.id = row.id;
            result.created_at = row.happened_at;
            return result;
        }));
    });
}

module.exports = getAdmins;
