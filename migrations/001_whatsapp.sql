-- migrations/001_whatsapp.sql
-- Run this in your Supabase SQL editor (or via psql / Supabase CLI)
-- to create the tables required by whatsapp/supabaseStore.js

-- ─── 1. WhatsApp Sessions ─────────────────────────────────────────────────────
-- Stores the current conversational state per WhatsApp phone number.
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id          BIGSERIAL PRIMARY KEY,
    phone       TEXT        NOT NULL UNIQUE,        -- E.164, e.g. +254712345678
    state       TEXT        NOT NULL DEFAULT 'WELCOME',
    linked      BOOLEAN     NOT NULL DEFAULT FALSE,
    email       TEXT,                               -- linked mARI account email
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone ON whatsapp_sessions(phone);

-- ─── 2. WhatsApp Account Links ────────────────────────────────────────────────
-- Maps a WhatsApp phone number to an mARI user email.
CREATE TABLE IF NOT EXISTS whatsapp_links (
    id          BIGSERIAL PRIMARY KEY,
    phone       TEXT        NOT NULL UNIQUE,
    user_email  TEXT        NOT NULL,
    linked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_links_phone ON whatsapp_links(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_links_email ON whatsapp_links(user_email);

-- ─── 3. WhatsApp Message Log ──────────────────────────────────────────────────
-- Audit trail of every inbound/outbound message.
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id          BIGSERIAL PRIMARY KEY,
    phone       TEXT        NOT NULL,
    direction   TEXT        NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    body        TEXT        NOT NULL,
    channel     TEXT        NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms')),
    status      TEXT        NOT NULL DEFAULT 'sent',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- ─── 4. Row Level Security (RLS) ─────────────────────────────────────────────
-- Only the service role (backend) should access these tables.
-- The anon key should NOT have direct access.
ALTER TABLE whatsapp_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages  ENABLE ROW LEVEL SECURITY;

-- Service role bypass (Supabase service_role key always bypasses RLS).
-- If you need anon access for specific purposes, add policies below.
