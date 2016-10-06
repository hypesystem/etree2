function updateAdminEndpoint(pool, req, res) {
    res.redirect("/admin");
}

module.exports = function(pool) {
    return updateAdminEndpoint.bind(this, pool);
};
