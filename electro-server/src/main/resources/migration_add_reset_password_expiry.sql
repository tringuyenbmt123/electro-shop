-- Migration script to add reset_password_token_expiry field to user table
-- This field stores the expiry time for password reset tokens (security enhancement)

ALTER TABLE `user` 
ADD COLUMN `reset_password_token_expiry` DATETIME(6) NULL AFTER `reset_password_token`;

-- Optional: Clear existing reset tokens (for security, since they now need expiry)
UPDATE `user` SET `reset_password_token` = NULL WHERE `reset_password_token` IS NOT NULL;

-- Add comment for documentation
ALTER TABLE `user` 
MODIFY COLUMN `reset_password_token_expiry` DATETIME(6) NULL 
COMMENT 'Expiry time for password reset token (15 minutes validity)';
