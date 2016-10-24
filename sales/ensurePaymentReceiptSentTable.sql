CREATE TABLE IF NOT EXISTS payment_receipt_sent
(
    id uuid,
    happened_at timestamp without time zone NOT NULL,
    data json NOT NULL
)
