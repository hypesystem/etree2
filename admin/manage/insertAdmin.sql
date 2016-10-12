INSERT INTO admin_created (id, data, happened_at)
     VALUES ($1::uuid, $2::json, $3::timestamp);
