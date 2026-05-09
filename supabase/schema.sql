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
                CHECK (role IN ('autistic_adult','caregiver','professional','educator','employer')),
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

CREATE OR REPLACE FUNCTION public.is_employee()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_employee FROM profiles WHERE id = auth.uid()), FALSE);
$$;

CREATE POLICY "Employees read all profiles"
  ON profiles FOR SELECT
  USING (public.is_employee());

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
  youtube_id               TEXT NOT NULL UNIQUE,
  title                    TEXT NOT NULL,
  description              TEXT,
  category                 TEXT NOT NULL
                           CHECK (category IN ('Housing','Employment','Mental Health','Relationships','Identity','KIDS')),
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
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

-- ============================================================
-- TOPICS
-- ============================================================
CREATE TABLE IF NOT EXISTS topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT DEFAULT '📌',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads topics"
  ON topics FOR SELECT USING (TRUE);

CREATE POLICY "Employees manage topics"
  ON topics FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads tags"
  ON tags FOR SELECT USING (TRUE);

CREATE POLICY "Employees manage tags"
  ON tags FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- VIDEO TAGS (join)
-- ============================================================
CREATE TABLE IF NOT EXISTS video_tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  tag_id   UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(video_id, tag_id)
);

ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads video_tags"
  ON video_tags FOR SELECT USING (TRUE);

CREATE POLICY "Employees manage video_tags"
  ON video_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- SPEAKERS
-- ============================================================
CREATE TABLE IF NOT EXISTS speakers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  bio               TEXT,
  credentials       TEXT,
  organization      TEXT,
  profile_image_url TEXT,
  website_url       TEXT,
  contact_url       TEXT,
  topic_specialties TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads speakers"
  ON speakers FOR SELECT USING (TRUE);

CREATE POLICY "Employees manage speakers"
  ON speakers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- VIDEO SPEAKERS (join)
-- ============================================================
CREATE TABLE IF NOT EXISTS video_speakers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id   UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  speaker_id UUID REFERENCES speakers(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(video_id, speaker_id)
);

ALTER TABLE video_speakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads video_speakers"
  ON video_speakers FOR SELECT USING (TRUE);

CREATE POLICY "Employees manage video_speakers"
  ON video_speakers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- VIDEOS — add new columns
-- ============================================================
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS topic_id                  UUID REFERENCES topics(id),
  ADD COLUMN IF NOT EXISTS certificate_eligible      BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS estimated_learning_minutes INTEGER DEFAULT 0;

-- ============================================================
-- PLAYLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS playlists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  topic_id      UUID REFERENCES topics(id),
  tags          TEXT[] DEFAULT '{}',
  is_premium    BOOLEAN DEFAULT FALSE NOT NULL,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads free playlists"
  ON playlists FOR SELECT USING (is_premium = FALSE);

CREATE POLICY "Premium users read premium playlists"
  ON playlists FOR SELECT
  USING (
    is_premium = TRUE AND
    EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = auth.uid() AND s.plan = 'premium' AND s.status = 'active')
  );

CREATE POLICY "Employees manage playlists"
  ON playlists FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- PLAYLIST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS playlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  video_id    UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  position    INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(playlist_id, video_id)
);

ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads playlist_items"
  ON playlist_items FOR SELECT USING (TRUE);

CREATE POLICY "Employees manage playlist_items"
  ON playlist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- COLLECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS collections (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL,
  description          TEXT,
  thumbnail_url        TEXT,
  topic_id             UUID REFERENCES topics(id),
  tags                 TEXT[] DEFAULT '{}',
  is_premium           BOOLEAN DEFAULT FALSE NOT NULL,
  certificate_eligible BOOLEAN DEFAULT FALSE NOT NULL,
  estimated_hours      NUMERIC(5,1) DEFAULT 0,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads free collections"
  ON collections FOR SELECT USING (is_premium = FALSE);

CREATE POLICY "Premium users read premium collections"
  ON collections FOR SELECT
  USING (
    is_premium = TRUE AND
    EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = auth.uid() AND s.plan = 'premium' AND s.status = 'active')
  );

CREATE POLICY "Employees manage collections"
  ON collections FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- COLLECTION ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS collection_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  video_id      UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  position      INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(collection_id, video_id)
);

ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads collection_items"
  ON collection_items FOR SELECT USING (TRUE);

CREATE POLICY "Employees manage collection_items"
  ON collection_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- LEARNING RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id      UUID REFERENCES videos(id) ON DELETE SET NULL,
  playlist_id   UUID REFERENCES playlists(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  watched_seconds INTEGER DEFAULT 0,
  completed     BOOLEAN DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  record_type   TEXT NOT NULL CHECK (record_type IN ('video','playlist','collection')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own learning records"
  ON learning_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees read all learning records"
  ON learning_records FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id         UUID REFERENCES videos(id) ON DELETE SET NULL,
  playlist_id      UUID REFERENCES playlists(id) ON DELETE SET NULL,
  collection_id    UUID REFERENCES collections(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  recipient_name   TEXT NOT NULL,
  learning_hours   NUMERIC(5,1) DEFAULT 0,
  issued_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  certificate_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Employees manage certificates"
  ON certificates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- DISCUSSION POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS discussion_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id       UUID REFERENCES videos(id) ON DELETE CASCADE,
  title          TEXT,
  body           TEXT NOT NULL,
  tags           TEXT[] DEFAULT '{}',
  status         TEXT DEFAULT 'visible' NOT NULL CHECK (status IN ('visible','hidden','removed')),
  reported_count INTEGER DEFAULT 0 NOT NULL,
  is_hidden      BOOLEAN DEFAULT FALSE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads visible posts"
  ON discussion_posts FOR SELECT
  USING (is_hidden = FALSE AND status = 'visible');

CREATE POLICY "Authenticated users create posts"
  ON discussion_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own posts"
  ON discussion_posts FOR UPDATE
  USING (auth.uid() = user_id AND is_hidden = FALSE)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own posts"
  ON discussion_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Employees manage all posts"
  ON discussion_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- DISCUSSION COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS discussion_comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID REFERENCES discussion_posts(id) ON DELETE CASCADE NOT NULL,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  status            TEXT DEFAULT 'visible' NOT NULL CHECK (status IN ('visible','hidden','removed')),
  reported_count    INTEGER DEFAULT 0 NOT NULL,
  is_hidden         BOOLEAN DEFAULT FALSE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads visible comments"
  ON discussion_comments FOR SELECT
  USING (is_hidden = FALSE AND status = 'visible');

CREATE POLICY "Authenticated users create comments"
  ON discussion_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own comments"
  ON discussion_comments FOR UPDATE
  USING (auth.uid() = user_id AND is_hidden = FALSE)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own comments"
  ON discussion_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Employees manage all comments"
  ON discussion_comments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id     UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  comment_id  UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
  reason      TEXT,
  status      TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending','reviewed','resolved')),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Employees read all reports"
  ON reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

CREATE POLICY "Employees update reports"
  ON reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- EXTERNAL ORGANIZATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS external_organizations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  website_url       TEXT,
  organization_type TEXT,
  location          TEXT,
  topics            TEXT[] DEFAULT '{}',
  is_visible        BOOLEAN DEFAULT TRUE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE external_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads visible organizations"
  ON external_organizations FOR SELECT
  USING (is_visible = TRUE);

CREATE POLICY "Employees manage organizations"
  ON external_organizations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_employee = TRUE));

-- ============================================================
-- SAVED PLAYLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  saved_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, playlist_id)
);

ALTER TABLE saved_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved playlists"
  ON saved_playlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS for new tables
-- ============================================================
CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER speakers_updated_at
  BEFORE UPDATE ON speakers
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER learning_records_updated_at
  BEFORE UPDATE ON learning_records
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER discussion_posts_updated_at
  BEFORE UPDATE ON discussion_posts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER discussion_comments_updated_at
  BEFORE UPDATE ON discussion_comments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER external_organizations_updated_at
  BEFORE UPDATE ON external_organizations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- INDEXES for new tables
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_speakers_name ON speakers(name);
CREATE INDEX IF NOT EXISTS idx_video_tags_video ON video_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag ON video_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_video_speakers_video ON video_speakers(video_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id, position);
CREATE INDEX IF NOT EXISTS idx_learning_records_user ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_video ON discussion_posts(video_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_status ON discussion_posts(status, is_hidden);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_post ON discussion_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_videos_topic ON videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_videos_certificate ON videos(certificate_eligible);
