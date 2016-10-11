function updatePasswordEndpoint(pool, req, res) {
    return res.redirect("/admin");
}

module.exports = function(pool) {
    return updatePasswordEndpoint.bind(this, pool);
};
