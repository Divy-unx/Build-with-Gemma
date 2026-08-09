CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
