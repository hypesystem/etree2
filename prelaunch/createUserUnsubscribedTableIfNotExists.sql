CREATE TABLE IF NOT EXISTS user_unsubscribed_from_newsletter
(
    id uuid NOT NULL,
    happened_at timestamp without time zone NOT NULL,
    PRIMARY KEY (id)
)
