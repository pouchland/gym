-- =============================================
-- Gym Tracker Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT,
  is_custom BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_exercises_user_id ON exercises(user_id);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

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

-- 3. Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_started_at ON workouts(started_at);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

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

-- 4. Workout Sets table
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight NUMERIC(6,2),
  rpe NUMERIC(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_workout_sets_workout_id ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

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

-- 5. Seed default exercises
INSERT INTO exercises (name, muscle_group, is_custom) VALUES
  ('Bench Press', 'Chest', false),
  ('Incline Bench Press', 'Chest', false),
  ('Dumbbell Press', 'Chest', false),
  ('Cable Fly', 'Chest', false),
  ('Squat', 'Legs', false),
  ('Leg Press', 'Legs', false),
  ('Romanian Deadlift', 'Legs', false),
  ('Leg Curl', 'Legs', false),
  ('Leg Extension', 'Legs', false),
  ('Calf Raise', 'Legs', false),
  ('Deadlift', 'Back', false),
  ('Barbell Row', 'Back', false),
  ('Pull Up', 'Back', false),
  ('Lat Pulldown', 'Back', false),
  ('Overhead Press', 'Shoulders', false),
  ('Lateral Raise', 'Shoulders', false),
  ('Face Pull', 'Shoulders', false),
  ('Dumbbell Curl', 'Arms', false),
  ('Tricep Pushdown', 'Arms', false),
  ('Plank', 'Core', false);
