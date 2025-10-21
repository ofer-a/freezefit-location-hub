-- Add sender name to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);

-- Update existing messages with sender names where possible
UPDATE messages
SET sender_name = p.full_name
FROM profiles p
WHERE messages.user_id = p.id AND messages.sender_name IS NULL;
