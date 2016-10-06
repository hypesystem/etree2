function createAdminEndpoint(pool, req, res) {
    res.redirect("/admin");
}

module.exports = function(pool) {
    return createAdminEndpoint.bind(this, pool);
};
