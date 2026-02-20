-- =============================================
-- Disable RLS and add username support
-- Run this in your Supabase SQL Editor
-- =============================================

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets DISABLE ROW LEVEL SECURITY;

-- Make user_id nullable on workouts so inserts work without auth
ALTER TABLE workouts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE workouts ALTER COLUMN user_id DROP DEFAULT;

-- Add username column to workouts
ALTER TABLE workouts ADD COLUMN username TEXT;
