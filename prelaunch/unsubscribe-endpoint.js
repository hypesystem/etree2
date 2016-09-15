var createUserUnsubscribedTableIfNotExists = require("./createUserUnsubscribedTableIfNotExists.js");

function unsubscribeEndpoint(pool, req, res) {
    var id = req.params.id;
    if(!id) {
        return res.fail(400, "Mangler påkrævet id for at afmelde.");
    }
    if(!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return res.fail(400, "Det givne id er ikke korrekt formatteret.");
    }
    pool.query("SELECT FROM user_signed_up_for_newsletter WHERE id = $1::uuid", [id], (error, result) => {
        if(error) {
            console.error("Failed to check if user signup newsletter id exists (before unsubscribing)", error);
            return res.fail(500);
        }
        if(result.rows.length < 1) {
            return res.fail(400, "Det givne id findes ikke. Ingen bruger fundet, som kan afmeldes.");
        }
        pool.query("INSERT INTO user_unsubscribed_from_newsletter (id, happened_at) VALUES ($1::uuid, $2::timestamp)", [id, new Date().toISOString()], (error) => {
            if(error) {
                console.error("Failed to insert unsubscribed notice", error);
                return res.fail(500);
            }
            res.redirect("/unsubscribed");
        });
    });
}

module.exports = function(pool) {
    createUserUnsubscribedTableIfNotExists(pool);
    return unsubscribeEndpoint.bind(this, pool);
}
