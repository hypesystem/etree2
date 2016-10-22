CREATE TABLE IF NOT EXISTS payment_completed
(
    id uuid,
    happened_at timestamp without time zone NOT NULL,
    data json NOT NULL
)
