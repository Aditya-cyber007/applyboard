-- Run this in your Supabase project → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS applications (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  company      TEXT NOT NULL,
  role         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'applied'
               CHECK (status IN ('applied','screening','technical','final','offer','rejected')),
  job_url      TEXT,
  salary       TEXT,
  location     TEXT,
  notes        TEXT,
  applied_date DATE DEFAULT CURRENT_DATE,
  ai_score     INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_gaps      JSONB,
  ai_summary   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index so queries by user are fast
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Optional: auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
