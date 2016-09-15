CREATE TABLE IF NOT EXISTS user_signed_up_for_newsletter
(
    id uuid NOT NULL,
    happened_at timestamp without time zone NOT NULL,
    data json NOT NULL,
    PRIMARY KEY (id)
)
