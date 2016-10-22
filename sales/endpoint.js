function salesEndpoint(pool, req, res) {
    res.send("hello");
}

module.exports = function(pool) {
    return salesEndpoint.bind(this, pool);
};
