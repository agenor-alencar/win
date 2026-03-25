-- Migration: Add expira_em column to password_reset_tokens if missing
ALTER TABLE password_reset_tokens
ADD COLUMN IF NOT EXISTS expira_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
