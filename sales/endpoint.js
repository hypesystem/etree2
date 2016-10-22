function salesEndpoint(pool, req, res) {
    res.send(req.body);
}

module.exports = function(pool) {
    return salesEndpoint.bind(this, pool);
};
