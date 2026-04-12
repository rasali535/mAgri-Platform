-- migrations/004_vuka_resources.sql
-- Run this in your Supabase SQL editor to create Vuka and Resources tables

-- ─── 1. Vuka Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vuka_users (
    msisdn          TEXT PRIMARY KEY,
    name            TEXT,
    whatsapp_number TEXT,
    role            TEXT DEFAULT 'farmer',
    bio             TEXT,
    lat             REAL,
    lng             REAL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vuka_users_msisdn ON vuka_users(msisdn);

-- ─── 2. Resources (Scans, Listings meta) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
    id          BIGSERIAL PRIMARY KEY,
    phone       TEXT NOT NULL,
    title       TEXT,
    type        TEXT, -- 'Diagnosis', 'Listing', etc.
    description TEXT,
    image       TEXT, -- Base64 or URL
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_phone ON resources(phone);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);

-- ─── 3. Add to RLS ────────────────────────────────────────────────────────
ALTER TABLE vuka_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources  ENABLE ROW LEVEL SECURITY;

-- Service role bypass is automatic.
