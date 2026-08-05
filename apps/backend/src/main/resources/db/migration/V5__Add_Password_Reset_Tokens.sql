-- Password reset tokens: short-lived, single-use, tied to one user.
-- Never expose the token itself via any API response — only ever delivered by email.

CREATE TABLE password_reset_tokens (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_pwdreset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_pwdreset_token UNIQUE (token)
) ENGINE=InnoDB;
