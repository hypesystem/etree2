var getPurchaseEvents = require("../getPurchaseEvents.js");
var fs = require("fs");
var path = require("path");
var receiptHtmlView = fs.readFileSync(path.join(__dirname, "receipt.html")).toString();
var receiptTextView = fs.readFileSync(path.join(__dirname, "receipt.text")).toString();
var renderView = require("../../../renderView.js");
var ensureOrderReceiptTable = require("./ensureOrderReceiptTable.js");

function roughSendReceiptEndpoint(pool, mailer, req, res) {
    var transactionId = req.params.id;
    if(!transactionId) {
        return res.fail(400, "Missing transaction id");
    }
    getPurchaseEvents(pool, (error, events) => {
        if(error) {
            console.error("Failed to get purchase events", error);
            return res.fail(500);
        }
        var relevantEvents = events.filter(event => event.id == transactionId);
        if(!relevantEvents) {
            return res.fail(400, "Not found transaction id");
        }
        
        var viewModel = {
            orderNumber: transactionId.substring(0, 8).toUpperCase(),
            receivedDate: new Date().toISOString().substring(0, 10)
        };
        var recipient = {};
        relevantEvents.forEach(event => {
            if(event.type == "payment_started") {
                viewModel.orderLines = event.data.orderLines;
                viewModel.amount = event.data.amount;
                viewModel.vat = (event.data.amount * 0.2).toFixed(2);
                recipient.email = event.data.customerInfo.email;
            }
            else if(event.type == "payment_completed") {
                viewModel.orderDate = event.happened_at.toISOString().substring(0, 10);
            }
        });
        renderView(receiptHtmlView, viewModel, (error, receiptHtml) => {
            if(error) {
                console.error("failed to render receipt html view", error);
                return res.fail(500);
            }
            renderView(receiptTextView, viewModel, (error, receiptText) => {
                if(error) {
                    console.error("failed to render receipt text view", error);
                    return res.fail(500);
                }
                var template = {
                    subject: "🎄 Kvittering 🎄",
                    html: receiptHtml,
                    text: receiptText
                };
                mailer.send(template, recipient, (error) => {
                    if(error) {
                        console.error("Failed to send receipt for receival", error);
                        return res.fail(500);
                    }
                    pool.query("INSERT INTO order_received_receipt_sent (id, data, happened_at) VALUES ($1::uuid, $2::json, $3::timestamp)", [
                        transactionId,
                        JSON.stringify({
                            viewModel: viewModel,
                            htmlVersion: receiptHtml,
                            textVersion: receiptText,
                            subject: template.subject
                        }),
                        new Date().toISOString()
                    ], (error) => {
                        if(error) {
                            console.error("Failed to save order received receipt sent event", error);
                            return res.fail(500);
                        }
                        res.redirect("/admin/sales-stats");
                    });
                });
            });
        });
    });
}

module.exports = function(pool, mailer) {
    ensureOrderReceiptTable(pool);
    return roughSendReceiptEndpoint.bind(this, pool, mailer);
};
