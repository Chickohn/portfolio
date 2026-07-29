CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE victoria_user_role AS ENUM ('owner', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE victoria_activity_event_type AS ENUM (
    'page_view',
    'session_started',
    'message_sent',
    'memory_viewed',
    'easter_egg_found',
    'gallery_opened',
    'welcome_completed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS victoria_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE CHECK (username IN ('freddie', 'victoria')),
  display_name text NOT NULL,
  role victoria_user_role NOT NULL,
  welcome_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS victoria_claim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL DEFAULT 'cli',
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS victoria_claim_tokens_user_idx ON victoria_claim_tokens(user_id);
CREATE INDEX IF NOT EXISTS victoria_claim_tokens_lookup_idx ON victoria_claim_tokens(token_hash) WHERE used_at IS NULL AND revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS victoria_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE CASCADE,
  label text NOT NULL,
  browser_family text NOT NULL DEFAULT 'Unknown browser',
  os_family text NOT NULL DEFAULT 'Unknown OS',
  claimed_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS victoria_devices_user_idx ON victoria_devices(user_id);
CREATE INDEX IF NOT EXISTS victoria_devices_active_idx ON victoria_devices(user_id, revoked_at);

CREATE TABLE IF NOT EXISTS victoria_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES victoria_devices(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS victoria_sessions_lookup_idx ON victoria_sessions(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS victoria_sessions_device_idx ON victoria_sessions(device_id);

CREATE TABLE IF NOT EXISTS victoria_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  client_nonce text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  hidden_at timestamptz,
  UNIQUE(author_user_id, client_nonce)
);

CREATE INDEX IF NOT EXISTS victoria_messages_visible_created_idx ON victoria_messages(created_at, id) WHERE hidden_at IS NULL;

CREATE TABLE IF NOT EXISTS victoria_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id text,
  uploaded_by_user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE RESTRICT,
  storage_key text NOT NULL UNIQUE,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes > 0),
  width integer,
  height integer,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  hidden_at timestamptz
);

CREATE INDEX IF NOT EXISTS victoria_media_memory_idx ON victoria_media(memory_id) WHERE hidden_at IS NULL;

CREATE TABLE IF NOT EXISTS victoria_countdown_settings (
  id text PRIMARY KEY DEFAULT 'return',
  label text NOT NULL,
  target_at timestamptz NOT NULL,
  timezone text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (id = 'return')
);

INSERT INTO victoria_countdown_settings (id, label, target_at, timezone)
VALUES ('return', 'Until Victoria is back', '2026-09-18T15:00:00Z', 'Europe/London')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS victoria_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES victoria_devices(id) ON DELETE CASCADE,
  event_type victoria_activity_event_type NOT NULL,
  event_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS victoria_activity_user_created_idx ON victoria_activity_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS victoria_activity_type_created_idx ON victoria_activity_events(event_type, created_at DESC);
