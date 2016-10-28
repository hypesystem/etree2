CREATE TABLE IF NOT EXISTS voucher_created
(
    key text,
    happened_at timestamp without time zone NOT NULL,
    data json NOT NULL
)
