CREATE TABLE IF NOT EXISTS victoria_user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description text CHECK (description IS NULL OR char_length(description) <= 2000),
  occurs_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  hidden_at timestamptz
);

CREATE INDEX IF NOT EXISTS victoria_user_milestones_visible_idx ON victoria_user_milestones(occurs_on) WHERE hidden_at IS NULL;

CREATE TABLE IF NOT EXISTS victoria_user_future_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description text CHECK (description IS NULL OR char_length(description) <= 2000),
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  hidden_at timestamptz
);

CREATE INDEX IF NOT EXISTS victoria_user_future_plans_visible_idx ON victoria_user_future_plans(created_at) WHERE hidden_at IS NULL;
