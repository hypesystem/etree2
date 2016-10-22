var uuid = require("uuid");

function salesEndpoint(pool, paymentGateway, req, res) {
    //generate client token
    var customerId = uuid.v4();
    paymentGateway.generate({
        customerId: customerId
    }, (error, response) => {
        if(error) {
            console.error("Failed to generate client token for payment", error);
            return res.fail(500);
        }
        var clientToken = response.clientToken;
        res.send("hello " + clientToken);
    });
}

module.exports = function(pool, paymentGateway) {
    return salesEndpoint.bind(this, pool, paymentGateway);
};
