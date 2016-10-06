function getAdmins(pool, callback) {
    pool.query("SELECT * FROM admin_created", (error, result) => {
        if(error) {
            return callback(error);
        }
        callback(null, result.rows.map(row => row.data));
    });
}

module.exports = getAdmins;
