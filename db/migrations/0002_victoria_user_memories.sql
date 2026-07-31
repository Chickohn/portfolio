CREATE TABLE IF NOT EXISTS victoria_user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  occurs_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  hidden_at timestamptz
);

CREATE INDEX IF NOT EXISTS victoria_user_memories_visible_idx ON victoria_user_memories(occurs_on) WHERE hidden_at IS NULL;
