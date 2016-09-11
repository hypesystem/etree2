var Pool = require("pg-pool");
var config = require("config");

module.exports = function() {
    return postgresStatus.bind(this);
};

function postgresStatus(req, res) {
    var pool = new Pool(config.postgres);

    pool.query("SELECT VERSION(), NOW()", (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }
        result.rows[0].status = "running";
        res.send(result.rows[0]);
    });
}
