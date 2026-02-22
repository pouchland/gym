-- Weekly weigh-in tracking
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,1) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id, logged_at DESC);

-- RLS
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own weight logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);
