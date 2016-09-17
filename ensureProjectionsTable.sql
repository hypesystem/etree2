CREATE TABLE IF NOT EXISTS projection
(
    type varchar(1000) NOT NULL,
    id uuid,
    updated_at timestamp without time zone NOT NULL,
    data json NOT NULL,
    PRIMARY KEY (type, id)
)
