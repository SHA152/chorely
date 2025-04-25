-- Migration: Add password_reset_tokens table
-- This table stores password reset tokens with expiration times

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(128) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (token)
);

-- Create index for faster token lookups
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);