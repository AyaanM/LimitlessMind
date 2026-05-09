-- Autism Edmonton LMS — Database Schema
-- Run this in the Supabase SQL editor for your project

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  display_name  TEXT,
  avatar_id     TEXT DEFAULT 'avatar-1',
  role          TEXT DEFAULT 'autistic_adult' NOT NULL
                CHECK (role IN ('autistic_adult','caregiver','professional','educator','employer','employee')),
  font_size     TEXT DEFAULT 'normal'
                CHECK (font_size IN ('small','normal','large')),
  bio           TEXT,
  is_employee   BOOLEAN DEFAULT FALSE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Employees read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_employee = TRUE
    )
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan                    TEXT DEFAULT 'free' NOT NULL CHECK (plan IN ('free','premium')),
  status                  TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active','canceled','past_due','trialing')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  price_cents             INTEGER DEFAULT 1000,
  currency                TEXT DEFAULT 'CAD',
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Employees read all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE)
  );

-- ============================================================
-- VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vimeo_id                 TEXT NOT NULL UNIQUE,
  title                    TEXT NOT NULL,
  description              TEXT,
  category                 TEXT NOT NULL
                           CHECK (category IN ('Housing','Employment','Mental Health','Relationships','Identity')),
  speaker                  TEXT,
  thumbnail_url            TEXT,
  duration_seconds         INTEGER,
  tags                     TEXT[] DEFAULT '{}',
  is_premium               BOOLEAN DEFAULT FALSE NOT NULL,
  is_featured              BOOLEAN DEFAULT FALSE NOT NULL,
  is_autism_edmonton_pick  BOOLEAN DEFAULT FALSE NOT NULL,
  is_new_this_month        BOOLEAN DEFAULT FALSE NOT NULL,
  popularity_score         INTEGER DEFAULT 0,
  created_by               UUID REFERENCES auth.users(id),
  created_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads public videos"
  ON videos FOR SELECT
  USING (is_premium = FALSE);

CREATE POLICY "Premium subscribers read premium videos"
  ON videos FOR SELECT
  USING (
    is_premium = TRUE AND (
      EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = auth.uid()
          AND s.plan = 'premium'
          AND s.status = 'active'
      )
    )
  );

CREATE POLICY "Employees manage all videos"
  ON videos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE)
  );

-- ============================================================
-- VIDEO TRANSCRIPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS video_transcripts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id   UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_text  TEXT NOT NULL,
  language   TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE video_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read transcripts"
  ON video_transcripts FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Employees manage transcripts"
  ON video_transcripts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- VIDEO TRANSCRIPT SEGMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS video_transcript_segments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id      UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  start_time    NUMERIC(10,2) NOT NULL,
  end_time      NUMERIC(10,2) NOT NULL,
  text          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE video_transcript_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read segments"
  ON video_transcript_segments FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Employees manage segments"
  ON video_transcript_segments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- VIDEO ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS video_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id      UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz','reflection','worksheet')),
  content       JSONB DEFAULT '{}',
  is_premium    BOOLEAN DEFAULT FALSE NOT NULL,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE video_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read activities"
  ON video_activities FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Employees manage activities"
  ON video_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- WATCH PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS watch_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id         UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  progress_seconds INTEGER DEFAULT 0 NOT NULL,
  completed        BOOLEAN DEFAULT FALSE NOT NULL,
  last_watched_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, video_id)
);

ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watch progress"
  ON watch_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees read all watch progress"
  ON watch_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- SAVED VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_videos (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, video_id)
);

ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved videos"
  ON saved_videos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- GAMES
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL,
  game_type     TEXT DEFAULT 'built-in' CHECK (game_type IN ('built-in','iframe')),
  is_premium    BOOLEAN DEFAULT FALSE NOT NULL,
  difficulty    TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  thumbnail_url TEXT,
  iframe_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read public games"
  ON games FOR SELECT
  TO authenticated
  USING (is_premium = FALSE);

CREATE POLICY "Premium subscribers read premium games"
  ON games FOR SELECT
  TO authenticated
  USING (
    is_premium = TRUE AND
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid() AND s.plan = 'premium' AND s.status = 'active'
    )
  );

CREATE POLICY "Employees manage games"
  ON games FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- GAME PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS game_progress (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id    UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  completed  BOOLEAN DEFAULT FALSE NOT NULL,
  score      INTEGER,
  played_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, game_id)
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own game progress"
  ON game_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CONTACT CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  title         TEXT,
  organization  TEXT,
  email         TEXT,
  phone         TEXT,
  website       TEXT,
  description   TEXT,
  category      TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_visible    BOOLEAN DEFAULT TRUE NOT NULL,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE contact_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read visible contact cards"
  ON contact_cards FOR SELECT
  TO authenticated
  USING (is_visible = TRUE);

CREATE POLICY "Employees manage contact cards"
  ON contact_cards FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER watch_progress_updated_at
  BEFORE UPDATE ON watch_progress
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_is_premium ON videos(is_premium);
CREATE INDEX IF NOT EXISTS idx_videos_is_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_popularity ON videos(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_last_watched ON watch_progress(last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_videos_user ON saved_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_user ON game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_cards_order ON contact_cards(display_order);
