INSERT INTO user_signed_up_for_newsletter (id, happened_at, data)
VALUES ($1::uuid, $2::timestamp, $3::json)
