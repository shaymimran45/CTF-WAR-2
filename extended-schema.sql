-- Extended Database Schema for Enhanced CTF Platform
-- This schema extends the existing schema with additional features for contests and improved scoring

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contest Categories table for organizing contests
CREATE TABLE IF NOT EXISTS contest_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contests table (enhanced version of competitions)
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 0, -- 0 means unlimited
  min_participants INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL, -- draft, published, active, finished, cancelled
  rules TEXT, -- Contest rules in markdown format
  prizes TEXT, -- Contest prizes in markdown format
  first_blood_reward INTEGER DEFAULT 0, -- Points reward for first blood
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (category_id) REFERENCES contest_categories(id) ON DELETE SET NULL
);

-- Contest Participants table (tracks who registered for which contest)
CREATE TABLE IF NOT EXISTS contest_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL,
  user_id UUID,
  team_id UUID,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'registered' NOT NULL, -- registered, disqualified, banned
  score INTEGER DEFAULT 0,
  last_solve TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CHECK ((user_id IS NOT NULL) OR (team_id IS NOT NULL)),
  UNIQUE (contest_id, user_id),
  UNIQUE (contest_id, team_id)
);

-- Challenge Tags table for better organization
CREATE TABLE IF NOT EXISTS challenge_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge-Tag relationship table
CREATE TABLE IF NOT EXISTS challenge_tag_relations (
  challenge_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  PRIMARY KEY (challenge_id, tag_id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES challenge_tags(id) ON DELETE CASCADE
);

-- Challenge Statistics table for tracking solve rates and other metrics
CREATE TABLE IF NOT EXISTS challenge_statistics (
  challenge_id UUID PRIMARY KEY,
  solve_count INTEGER DEFAULT 0,
  first_solve TIMESTAMP WITH TIME ZONE,
  first_blood_user_id UUID, -- User who got first blood
  first_blood_team_id UUID, -- Team who got first blood
  last_solve TIMESTAMP WITH TIME ZONE,
  average_solve_time INTERVAL,
  rating DECIMAL(3,2) DEFAULT 0.00, -- Community rating 0.00 to 5.00
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  FOREIGN KEY (first_blood_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (first_blood_team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- First Blood Rewards table
CREATE TABLE IF NOT EXISTS first_blood_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL,
  user_id UUID,
  team_id UUID,
  reward_points INTEGER NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CHECK ((user_id IS NOT NULL) OR (team_id IS NOT NULL)),
  UNIQUE (challenge_id)
);

-- Contest Challenge relationship table (which challenges belong to which contests)
CREATE TABLE IF NOT EXISTS contest_challenges (
  contest_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_bonus BOOLEAN DEFAULT FALSE, -- Bonus challenges give extra points
  unlock_condition TEXT, -- JSON describing unlock conditions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (contest_id, challenge_id),
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Contest Leaderboard table for storing periodic snapshots
CREATE TABLE IF NOT EXISTS contest_leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL,
  user_id UUID,
  team_id UUID,
  position INTEGER NOT NULL,
  score INTEGER NOT NULL,
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CHECK ((user_id IS NOT NULL) OR (team_id IS NOT NULL))
);

-- User Achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, achievement_name)
);

-- Team Achievements table
CREATE TABLE IF NOT EXISTS team_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE (team_id, achievement_name)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  team_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add new columns to existing tables

-- Add contest_id to challenges table if not exists
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dynamic_points_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dynamic_points_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_blood_points INTEGER DEFAULT 0, -- Points for first blood solve
ADD COLUMN IF NOT EXISTS contest_id UUID REFERENCES contests(id);

-- Check if the fk_users_team constraint already exists before adding it
-- This prevents the "constraint already exists" error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_users_team' 
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT fk_users_team
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Check if the fk_teams_leader constraint already exists before adding it
-- This prevents the "constraint already exists" error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_teams_leader' 
    AND conrelid = 'teams'::regclass
  ) THEN
    ALTER TABLE teams
    ADD CONSTRAINT fk_teams_leader
    FOREIGN KEY (leader_id) REFERENCES users(id);
  END IF;
END
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);
CREATE INDEX IF NOT EXISTS idx_contests_end_time ON contests(end_time);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest_id ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user_id ON contest_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_team_id ON contest_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_score ON contest_participants(score);
CREATE INDEX IF NOT EXISTS idx_challenge_statistics_solve_count ON challenge_statistics(solve_count);
CREATE INDEX IF NOT EXISTS idx_challenge_statistics_rating ON challenge_statistics(rating);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_first_blood_rewards_challenge_id ON first_blood_rewards(challenge_id);
CREATE INDEX IF NOT EXISTS idx_first_blood_rewards_user_id ON first_blood_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_first_blood_rewards_team_id ON first_blood_rewards(team_id);
CREATE INDEX IF NOT EXISTS idx_challenges_contest_id ON challenges(contest_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contests table
DROP TRIGGER IF EXISTS update_contests_updated_at ON contests;
CREATE TRIGGER update_contests_updated_at
BEFORE UPDATE ON contests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample data for contest categories
INSERT INTO contest_categories (name, description, color) VALUES
  ('Beginner', 'Perfect for newcomers to CTF', '#10b981'),
  ('Intermediate', 'For those with some experience', '#f59e0b'),
  ('Advanced', 'Challenging contests for experienced players', '#ef4444'),
  ('Special Event', 'Special themed contests and events', '#8b5cf6'),
  ('Training', 'Practice contests for skill development', '#06b6d4')
ON CONFLICT (name) DO NOTHING;

-- Sample achievements
INSERT INTO challenge_tags (name, color) VALUES
  ('Web', '#10b981'),
  ('Crypto', '#f59e0b'),
  ('Pwn', '#ef4444'),
  ('Reverse', '#8b5cf6'),
  ('Forensics', '#06b6d4'),
  ('Stego', '#ec4899'),
  ('OSINT', '#f97316'),
  ('Misc', '#64748b')
ON CONFLICT (name) DO NOTHING;

-- First Blood Achievements
INSERT INTO challenge_tags (name, color) VALUES
  ('First Blood', '#ff0000')
ON CONFLICT (name) DO NOTHING;