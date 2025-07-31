-- Migration: Allow 'admin-2fa' as a valid type in tokens table for admin 2FA OTPs
ALTER TABLE tokens
  DROP CONSTRAINT IF EXISTS tokens_type_check,
  ADD CONSTRAINT tokens_type_check CHECK (type IN ('email-verification', 'password-reset', 'admin-2fa')); 