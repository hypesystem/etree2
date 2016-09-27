CREATE TABLE IF NOT EXISTS admin_created
(
    id uuid NOT NULL,
    happened_at timestamp without time zone NOT NULL,
    data json NOT NULL,
    PRIMARY KEY (id)
)
