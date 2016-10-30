var uuid = require("uuid");
var renderView = require("../renderView.js");
var fs = require("fs");
var path = require("path");
var ensurePaymentEventTables = require("./ensurePaymentEventTables.js");
var productData = require("./productData.json");
var Vouchers = require("../voucher/voucher.js");

function salesEndpoint(pool, mailer, paymentGateway, req, res) {
    if(req.body.payment_method_nonce) {
        return completePayment(pool, mailer, paymentGateway, req, res);
    }
    startPayment(pool, paymentGateway, req, res);
}

function startPayment(pool, paymentGateway, req, res) {
    var vouchers = Vouchers(pool);
    parseOrderInfo(vouchers, req.body, (error, orderLines, amount, voucher, customerInfo) => {
        if(error && error.type == "input") {
            console.log("Invalid input to parse order info", error);
            return res.fail(400, "Forkert input: " + error.message);
        }
        if(error) {
            console.error("Failed to parse order lines", error);
            return res.fail(500);
        }
        paymentGateway.clientToken.generate({}, (error, response) => {
            if(error) {
                console.error("Failed to generate client token for payment", error);
                return res.fail(500);
            }
            if(!response.success) {
                console.error("Failed to generate client token from braintree", response);
                return res.fail(500);
            }
            var transactionId = uuid.v4();
            var viewModel = {
                clientToken: response.clientToken,
                transactionId: transactionId,
                orderLines: orderLines,
                amount: amount
            };
            var paymentData = {
                originalRequest: req.body,
                orderLines: orderLines,
                amount: amount,
                voucher: voucher,
                customerInfo: customerInfo
            };
            pool.query("INSERT INTO payment_started (id, data, happened_at) VALUES ($1::uuid, $2::json, $3::timestamp)", [
                transactionId,
                JSON.stringify(paymentData),
                new Date().toISOString()
            ], (error) => {
                if(error) {
                    console.error("Failed to insert payment_started", error);
                    return res.fail(500);
                }
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
        });
    });
}

function parseOrderInfo(pool, raw, callback) {
    parseOrderLines(pool, raw, (error, orderLines, amount, voucher) => {
        if(error) {
            return callback(error);
        }
        parseCustomerInfo(raw, (error, customerInfo) => {
            if(error) {
                return callback(error);
            }
            callback(null, orderLines, amount, voucher, customerInfo);
        });
    });
}

function parseOrderLines(vouchers, raw, callback) {
    var orderLines = [];
    var amount = 0;
    
    var treeSizeInput = raw["tree-size"];
    if(!treeSizeInput || treeSizeInput == "") {
        return callback({
            type: "input",
            message: "Mangler træstørrelse",
            error: new Error("Missing tree size")
        });
    }
    var treeSize = productData.treeSizes.find(treeSize => treeSize.name == treeSizeInput);
    if(!treeSize) {
        return callback({
            type: "input",
            message: "Invalid træstørrelse",
            error: new Error("Wrong tree size")
        });
    }
    orderLines.push({
        name: "Træ, " + treeSize.name + ", " + treeSize.minHeight + "-" + treeSize.maxHeight + " cm",
        price: treeSize.price 
    });
    amount += treeSize.price;
    
    var footIncluded = raw["tree-foot"] == "yes";
    if(footIncluded) {
        orderLines.push({
            name: "+ fod",
            price: productData.footPrice
        });
        amount += productData.footPrice;
    }
    
    //TODO: pickup?
    orderLines.push({
        name: "Levering",
        price: productData.deliveryPrice
    });
    amount += productData.deliveryPrice;
    
    var disposalIncluded = raw["tree-disposal"] == "yes";
    if(disposalIncluded) {
        orderLines.push({
            name: "Afhentning efter jul",
            price: productData.collectionPrice
        });
        amount += productData.collectionPrice;
    }
    
    parseVoucher(vouchers, raw, (error, voucher) => {
        if(error && error.type == "voucher_key_not_found") {
            console.log("User tried to use an invalid voucher", error);
            return callback(null, orderLines, amount);
        }
        if(error) {
            return callback(error);
        }
        if(!voucher) {
            return callback(null, orderLines, amount);
        }
        
        orderLines.push({
            name: voucher.name,
            price: - voucher.rebate
        });
        amount -= voucher.rebate;
        
        callback(null, orderLines, amount, voucher);
    });
}

function parseVoucher(vouchers, raw, callback) {
    var voucherKey = raw["voucher"];
    if(!voucherKey || voucherKey == "") {
        return callback();
    }
    vouchers.use(voucherKey, (error, voucher) => {
        if(error && error.type == "voucher_cannot_be_used") {
            console.log("User tried to use inactive voucher", voucherKey);
            return callback();
        }
        if(error) {
            return callback(error);
        }
        callback(null, voucher);
    });
}

function parseCustomerInfo(raw, callback) {
    var customer = {};
    
    var email = raw["contact-email"];
    if(!email) {
        return callback({
            type: "input",
            message: "Mangler email",
            error: new Error("Missing contact email")
        });
    }
    if(!email.match(/[^@]+@[^@]+/)) {
        return callback({
            type: "input",
            message: "Invalid email " + email,
            error: new Error("Invalid email")
        });
    }
    customer.email = email;
    
    var phoneNumber = raw["contact-phone"];
    if(phoneNumber) {
        customer.phoneNumber = phoneNumber;
    }
    
    customer.comments = raw["comments"];
    
    parseAddress(raw, "billing-", (error, billingAddress) => {
        if(error) {
            return callback(error);
        }
        customer.billingAddress = billingAddress;
        var deliverySameAsBilling = raw["delivery-same-as-billing"] == "on";
        customer.deliverySameAsBilling = deliverySameAsBilling;
        if(deliverySameAsBilling) {
            customer.deliveryAddress = billingAddress;
            return callback(null, customer);
        }
        parseAddress(raw, "delivery-", (error, deliveryAddress) => {
            if(error) {
                return callback(error);
            }
            customer.deliveryAddress = deliveryAddress;
            callback(null, customer);
        });
    });
}

function parseAddress(raw, prefix, callback) {
    var address = {};
    
    var name = raw[prefix + "name"];
    if(!name) {
        return callback({
            type: "input",
            message: "Mangler navn på adresseejer",
            error: new Error("Missing address name for " + prefix)
        });
    }
    address.name = name;
    
    var streetAddress = raw[prefix + "streetname"];
    if(!streetAddress) {
        return callback({
            type: "input",
            message: "Mangler vejadresse",
            error: new Error("Missing street address for " + prefix)
        });
    }
    address.streetAddress = streetAddress;
    
    var zip = raw[prefix + "zip"];
    if(!zip || zip.length != 4) {
        return callback({
            type: "input",
            message: "Mangler postnr",
            error: new Error("Missing zip for " + prefix)
        });
    }
    address.zip = zip;
    
    var city = raw[prefix + "city"];
    if(!city) {
        return callback({
            type: "input",
            message: "Mangler by",
            error: new Error("Missing city for " + prefix)
        });
    }
    address.city = city;
    
    callback(null, address);
}

function completePayment(pool, mailer, paymentGateway, req, res) {
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
        var transactionStartData = result.rows[0].data;
        var amount = transactionStartData.amount;
        paymentGateway.transaction.sale({
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
                    //TODO: Better errors?
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
                sendReceiptEmail(pool, mailer, transactionId, transactionStartData, (error) => {
                    if(error) {
                        console.error("Failed to send receipt", error);
                        return res.fail(500);
                    }
                    res.redirect("/tak-for-handlen");
                });
            });
        });
    });
}

function sendReceiptEmail(pool, mailer, transactionId, transactionStartData, callback) {
    //TODO: Save sent emails to db for later inspection (viewmodel + html email + text email)
    var viewModel = {
        orderNumber: transactionId.substring(0, 8).toUpperCase(),
        orderDate: new Date().toISOString().substring(0, 10),
        customer: transactionStartData.customerInfo,
        orderLines: transactionStartData.orderLines,
        amount: transactionStartData.amount,
        vat: (transactionStartData.amount * 0.2).toFixed(2)
    };
    fs.readFile(path.join(__dirname, "email-receipt.html"), (error, buf) => {
        if(error) {
            return callback(error);
        }
        renderView(buf.toString(), viewModel, (error, emailContentsHtml) => {
            if(error) {
                return callback(error);
            }
            fs.readFile(path.join(__dirname, "email-receipt.text"), (error, buf) => {
                if(error) {
                    return callback(error);
                }
                renderView(buf.toString(), viewModel, (error, emailContentsText) => {
                    var template = {
                        subject: "Ordrebekræftigelse (juletræ fra etree.dk)",
                        html: emailContentsHtml,
                        text: emailContentsText
                    };
                    var recipient = { email: transactionStartData.customerInfo.email };
                    mailer.send(template, recipient, (error) => {
                        if(error) {
                            return callback(error);
                        }
                        pool.query("INSERT INTO payment_receipt_sent (id, data, happened_at) VALUES ($1::uuid, $2::json, $3::timestamp)", [
                            transactionId,
                            JSON.stringify({
                                viewModel: viewModel,
                                htmlVersion: emailContentsHtml,
                                textVersion: emailContentsText
                            }),
                            new Date().toISOString()
                        ], callback);
                    });
                });
            });
        });
    });
}

module.exports = function(pool, mailer, paymentGateway) {
    ensurePaymentEventTables(pool);
    return salesEndpoint.bind(this, pool, mailer, paymentGateway);
};
