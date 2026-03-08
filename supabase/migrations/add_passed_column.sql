-- Pass 기능: 너무 쉬운 단어 영구 제외
ALTER TABLE user_word_history ADD COLUMN IF NOT EXISTS passed boolean DEFAULT false;
