INSERT INTO admin_created (id, data, happened_at)
     SELECT '10aeed75-db22-4432-bbb5-630262e16bd5', $1::json, $2::timestamp
     WHERE NOT EXISTS (SELECT 1 FROM admin_created WHERE id='10aeed75-db22-4432-bbb5-630262e16bd5');
