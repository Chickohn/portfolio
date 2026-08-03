CREATE TABLE IF NOT EXISTS victoria_minigame_scores (
  user_id uuid NOT NULL REFERENCES victoria_users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  high_score integer NOT NULL DEFAULT 0 CHECK (high_score >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id),
  CHECK (char_length(game_id) BETWEEN 1 AND 64)
);

CREATE INDEX IF NOT EXISTS victoria_minigame_scores_game_idx
  ON victoria_minigame_scores(game_id, high_score DESC);
