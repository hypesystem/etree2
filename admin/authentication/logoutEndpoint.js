function logoutEndpoint(req, res) {
    req.session = null;
    res.redirect("/");
}

module.exports = logoutEndpoint;
