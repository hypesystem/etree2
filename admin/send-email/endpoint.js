var getActiveSubscriptions = require("../list-subscribers/getActiveSubscriptions.js");

function sendEmailEndpoint(pool, mailer, req, res) {
    if(!req.body["email-subject"]) {
        return res.fail(400, "Missing email subject!");
    }
    if(!req.body["email-content-html"]) {
        return res.fail(400, "Missing HTML content");
    }
    if(!req.body["email-content-text"]) {
        return res.fail(400, "Missing text content");
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
            subject: req.body["email-subject"],
            html: req.body["email-content-html"],
            text: req.body["email-content-text"]
        };
        mailer.sendBatch(template, recipients, (error, mailId) => {
            if(error) {
                console.error("Failed to send email to recipients", recipients, error);
                return res.fail(500);
            }
            res.redirect("/admin/email/success");
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
            callback(null, newsletterRecipients.append(otherRecipients));
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
    var recipientsMissingField = parsed.filter(recipient => !recipient.name || !recipient.email);
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
