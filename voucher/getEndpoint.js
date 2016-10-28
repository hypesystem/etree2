var Vouchers = require("./voucher.js");

function getVoucher(vouchers, req, res) {
    if(!req.params.id) {
        return res.fail(400, "Missing voucher id");
    }
    vouchers.get(req.params.id, (error, voucher) => {
        if(error && error.type == "voucher_key_not_found") {
            return res.status(404).send({ error: "Not found" });
        }
        if(error) {
            console.error("Failed to get voucher " + req.params.id, error);
            return res.status(500).send({ error: "Failed to get" });
        }
        res.send(voucher);
    });
}

module.exports = function(pool) {
    var vouchers = Vouchers(pool);
    return getVoucher.bind(this, vouchers);
}
