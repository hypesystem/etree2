INSERT INTO projection (type, id, data, updated_at)
     SELECT 'subscriptions', 'ec7b33d7-8f01-4b4d-8822-e221c19ee227', $1::json, $2::timestamp
     WHERE NOT EXISTS (SELECT 1 FROM projection WHERE type='subscriptions');
