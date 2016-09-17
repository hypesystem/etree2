SELECT
  p.data AS state,
  p.updated_at AS last_projection_update_at,
  (SELECT happened_at FROM user_signed_up_for_newsletter ORDER BY happened_at DESC LIMIT 1) AS last_subscribe_happened_at,
  (SELECT happened_at FROM user_unsubscribed_from_newsletter ORDER BY happened_at DESC LIMIT 1) AS last_unsubscribe_happened_at
FROM
  projection p
WHERE
  p.type = 'subscriptions'
