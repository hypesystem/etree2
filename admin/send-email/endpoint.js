function sendEmailEndpoint(pool, req, res) {
    res.send("nope");
}

module.exports = function(pool) {
    return sendEmailEndpoint.bind(this, pool);
};
