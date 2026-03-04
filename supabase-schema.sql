-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Words table
CREATE TABLE words (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  word        text NOT NULL,
  definition  text NOT NULL,
  example     text,
  grade       int  NOT NULL CHECK (grade BETWEEN 3 AND 6),
  created_at  timestamptz DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id    uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  grade int NOT NULL DEFAULT 3 CHECK (grade BETWEEN 3 AND 6),
  name  text
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, grade)
  VALUES (new.id, 3);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- User word history table
CREATE TABLE user_word_history (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  word_id      uuid NOT NULL REFERENCES words ON DELETE CASCADE,
  viewed_at    timestamptz DEFAULT now(),
  quiz_result  boolean,  -- null=not attempted, true=correct, false=incorrect
  UNIQUE(user_id, word_id)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_history ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- History: users can only see/write their own history
CREATE POLICY "Users can view own history"
  ON user_word_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON user_word_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON user_word_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Words: everyone can read (no RLS needed, or use public policy)
CREATE POLICY "Anyone can read words"
  ON words FOR SELECT
  TO authenticated
  USING (true);
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Index for performance
CREATE INDEX idx_words_grade_created ON words (grade, created_at DESC);
CREATE INDEX idx_history_user_viewed ON user_word_history (user_id, viewed_at DESC);
