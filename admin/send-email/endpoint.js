var getActiveSubscriptions = require("../list-subscribers/getActiveSubscriptions.js");
var renderView = require("../../renderView.js");
var fs = require("fs");
var path = require("path");
var emailTemplate = fs.readFileSync(path.join(__dirname, "../..", "layouts/email.html")).toString();

function sendEmailEndpoint(pool, mailer, req, res) {
    var subject = req.body["email-subject"];
    if(!subject) {
        return res.fail(400, "Missing email subject!");
    }
    var htmlContent = req.body["email-content-html"];
    if(!htmlContent) {
        return res.fail(400, "Missing HTML content");
    }
    var textContent = req.body["email-content-text"];
    if(!textContent) {
        return res.fail(400, "Missing text content");
    }
    renderView(emailTemplate, { content: htmlContent }, (error, htmlContent) => {
        if(error) {
            console.error("Failed to render html email in email template", error);
            return res.fail(500);
        }
        getRecipients(pool, req.body["other-recipients"], req.body["newsletter-recipients"], (error, recipients) => {
            if(error && error.type == "input") {
                console.log("Recipient format failed", error);
                return res.fail(400, "Wrong recipients");
            }
            if(error) {
                console.error("Failed to get recipients for email", error);
                return res.fail(500);
            }
            var template = {
                subject: subject,
                html: htmlContent,
                text: textContent
            };
            mailer.sendBatch(template, recipients, (error, mailId) => {
                if(error) {
                    console.error("Failed to send email to recipients", recipients, error);
                    return res.fail(500);
                }
                res.redirect("/admin/email/success");
            });
        });
    });
}

function getRecipients(pool, otherRecipients, newsletterRecipients, callback) {
    var hasOtherRecipients = (otherRecipients && otherRecipients != "");
    if(!hasOtherRecipients && !newsletterRecipients) {
        return callback({
            type: "input",
            error: new Error("Neither other nor newsletter recipients")
        });
    }
    parseOtherRecipients(otherRecipients, (error, otherRecipients) => {
        if(error) {
            return callback(error);
        }
        console.log("other recipients", otherRecipients);
        if(!newsletterRecipients) {
            return callback(null, otherRecipients);
        }
        parseNewsletterRecipients(pool, (error, newsletterRecipients) => {
            if(error) {
                return callback(error);
            }
            console.log("newsletter recipients", newsletterRecipients);
            callback(null, newsletterRecipients.concat(otherRecipients));
        });
    });
}

function parseOtherRecipients(raw, callback) {
    var parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch(e) {
        return callback(e);
    }
    var recipientsMissingField = parsed.filter(recipient => !recipient.email);
    if(recipientsMissingField.length > 0) {
        return callback({
            type: "input",
            error: new Error("Some entires are missing required fields: " + JSON.stringify(recipientsMissingField))
        });
    }
    callback(null, parsed);
}

function parseNewsletterRecipients(pool, callback) {
    getActiveSubscriptions(pool, callback);
}

module.exports = function(pool, mailer) {
    return sendEmailEndpoint.bind(this, pool, mailer);
};
