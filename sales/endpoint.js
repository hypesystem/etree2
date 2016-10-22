var uuid = require("uuid");
var renderView = require("../renderView.js");
var fs = require("fs");
var path = require("path");
var ensurePaymentEventTables = require("./ensurePaymentEventTables.js");

function salesEndpoint(pool, paymentGateway, req, res) {
    if(req.body.payment_method_nonce) {
        completePayment(pool, paymentGateway, req, res);
    }
    startPayment(pool, paymentGateway, req, res);
}

function startPayment(pool, paymentGateway, req, res) {
    //TODO: validate form input
    //generate client token
    paymentGateway.clientToken.generate({}, (error, response) => {
        if(error) {
            console.error("Failed to generate client token for payment", error);
            return res.fail(500);
        }
        if(!response.success) {
            console.error("Failed to generate client token from braintree", response);
            return res.fail(500);
        }
        var viewModel = {
            clientToken: response.clientToken,
            transactionId: uuid.v4()
        };
        //TODO: Insert payment started event with amount etc.
        fs.readFile(path.join(__dirname, "paymentForm.html"), (error, buf) => {
            if(error) {
                console.error("Failed to read paymentForm view", error);
                return res.fail(500);
            }
            renderView(buf.toString(), viewModel, (error, result) => {
                if(error) {
                    console.error("Failed to build paymentForm view", error);
                    return res.fail(500);
                }
                res.send(result);
            });
        });
    });
}

function completePayment(pool, paymentGateway, req, res) {
    console.log("got", req.body);
    var nonce = req.body.payment_method_nonce;
    if(!nonce) {
        return res.fail(400, "No nonce given!");
    }
    var transactionId = req.body.transaction_id;
    if(!transactionId) {
        return res.fail(400, "No transactionId given");
    }
    pool.query("SELECT * FROM payment_started WHERE id = $1::uuid", [ transactionId ], (error, result) => {
        if(error) {
            console.error("Failed to get started payment for id", transactionId, error);
            return res.fail(500);
        }
        if(result.rows.length == 0) {
            console.log("Got request for non-exist transaction id", transactionId);
            return res.fail(400, "Forkert transaktions-ID (findes ikke)");
        }
        var amount = result.rows[0].data.amount;
        gateway.transaction.sale({
            amount: amount,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, (error, result) => {
            if(error) {
                console.error("Failed to create sale", error);
                return res.fail(500);
            }
            var transactionData = {
                amount: amount,
                nonce: nonce,
                transaction: result.transaction
            };
            if(!result.success) {
                console.error("Failed to create sale (response success false)", result.errors.deepErrors());
                return pool.query("INSERT INTO payment_failed (id, data, happened_at) VALUES ($1::uuid, $2::json, $3::timestamp)", [
                    transactionId,
                    JSON.stringify(transactionData),
                    new Date().toISOString()
                ], (error) => {
                    if(error) {
                        console.error("Failed to insert payment failed into db", error);
                    }
                    res.fail(500);
                });
            }
            pool.query("INSERT INTO payment_completed (id, data, happened_at) VALUES ($1::uuid, $2::json, $3::timestamp)", [
                transactionId,
                JSON.stringify(transactionData),
                new Date().toISOString()
            ], (error) => {
                if(error) {
                    console.error("Failed to save succesful transaction " + transactionId + " in db", error, transactionData);
                    return res.fail(500);
                }
                //TODO: Send faktura email
                res.redirect("/tak-for-handlen");
            });
        });
    });
}

module.exports = function(pool, paymentGateway) {
    ensurePaymentEventTables(pool);
    return salesEndpoint.bind(this, pool, paymentGateway);
};
