function getAdminFromUsername(pool, username, callback) {
    pool.query("SELECT * FROM admin_created", (error, result) => {
        if(error) {
            return callback(error);
        }
        var admin = result.rows.map(row => row.data).find(admin => {
            return admin.username == username;
        });
        callback(null, admin);
    });
}

module.exports = getAdminFromUsername;
