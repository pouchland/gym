-- =============================================
-- Migration 005: Re-enable Auth and RLS
-- Run this AFTER setting up proper auth
-- =============================================

-- 1. Re-enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_history ENABLE ROW LEVEL SECURITY;

-- 2. Fix workouts table - make user_id required again with proper default
ALTER TABLE workouts 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. Drop the temporary username column (we use auth properly now)
-- Note: Only run this if you don't need existing username data
-- ALTER TABLE workouts DROP COLUMN IF EXISTS username;

-- 4. Ensure proper RLS policies exist (re-create if missing)

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Exercises policies
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;

CREATE POLICY "Users can view exercises"
  ON exercises FOR SELECT TO authenticated
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Workouts policies  
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Workout Sets policies
DROP POLICY IF EXISTS "Users can view own sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can insert own sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can update own sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can delete own sets" ON workout_sets;

CREATE POLICY "Users can view own sets"
  ON workout_sets FOR SELECT TO authenticated
  USING (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own sets"
  ON workout_sets FOR INSERT TO authenticated
  WITH CHECK (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own sets"
  ON workout_sets FOR UPDATE TO authenticated
  USING (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  )
  WITH CHECK (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own sets"
  ON workout_sets FOR DELETE TO authenticated
  USING (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  );

-- User Stats policies
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- User Exercise History policies
DROP POLICY IF EXISTS "Users can view own exercise history" ON user_exercise_history;
DROP POLICY IF EXISTS "Users can insert own exercise history" ON user_exercise_history;

CREATE POLICY "Users can view own exercise history"
  ON user_exercise_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise history"
  ON user_exercise_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Exercise Library is viewable by all authenticated users
DROP POLICY IF EXISTS "Everyone can view exercise library" ON exercise_library;

CREATE POLICY "Everyone can view exercise library"
  ON exercise_library FOR SELECT TO authenticated
  USING (true);

-- 5. Update the auto-create profile function to work with auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  -- Also create user_stats entry
  INSERT INTO public.user_stats (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
