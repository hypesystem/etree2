CREATE TABLE IF NOT EXISTS payment_started
(
    id uuid,
    happened_at timestamp without time zone NOT NULL,
    data json NOT NULL
)
