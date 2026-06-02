ALTER TABLE letters
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

UPDATE letters
SET language = 'en'
WHERE language IS NULL;

COMMENT ON COLUMN letters.language IS 'Letter language code such as en or ur.';
