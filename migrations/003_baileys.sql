-- 003_baileys.sql
CREATE TABLE IF NOT EXISTS wa_auth (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Turn on RLS but allow service_role to bypass
ALTER TABLE wa_auth ENABLE ROW LEVEL SECURITY;

-- Add a reply column to session to allow us to send outbound messages easily via the dashboard
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='whatsapp_sessions' AND column_name='reply')
  THEN
      ALTER TABLE whatsapp_sessions ADD COLUMN reply TEXT;
  END IF;
END $$;
