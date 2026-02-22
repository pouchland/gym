-- =============================================
-- Migration 003: User Stats & Exercise Library
-- =============================================

-- 1. User Stats Table (replaces localStorage)
CREATE TABLE user_stats (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  bodyweight_kg NUMERIC(5,2),
  training_experience TEXT CHECK (training_experience IN ('beginner', 'intermediate', 'advanced')),
  
  -- Bench Press
  bench_press_1rm NUMERIC(6,2),
  bench_press_8rm NUMERIC(6,2),
  
  -- Squat
  squat_1rm NUMERIC(6,2),
  squat_8rm NUMERIC(6,2),
  
  -- Deadlift
  deadlift_1rm NUMERIC(6,2),
  deadlift_8rm NUMERIC(6,2),
  
  -- Overhead Press
  overhead_press_1rm NUMERIC(6,2),
  overhead_press_8rm NUMERIC(6,2),
  
  -- Program progress
  current_program TEXT DEFAULT 'bench_press_specialization',
  current_week INTEGER DEFAULT 1,
  current_workout_number INTEGER DEFAULT 1, -- 1, 2, or 3 per week
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

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

-- 2. Comprehensive Exercise Library
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  primary_muscles TEXT[], -- e.g., ['chest', 'front_delts']
  secondary_muscles TEXT[], -- e.g., ['triceps']
  equipment TEXT NOT NULL, -- barbell, dumbbell, cable, machine, bodyweight
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Metadata
  description TEXT,
  why_good TEXT, -- Why this exercise is effective
  pro_tips TEXT[], -- Array of tips
  common_mistakes TEXT[], -- What to avoid
  video_url TEXT, -- YouTube/tutorial link
  
  -- Tracking
  is_compound BOOLEAN DEFAULT false, -- multi-joint?
  is_isolation BOOLEAN DEFAULT false, -- single-joint?
  
  -- System
  is_system BOOLEAN DEFAULT true, -- Can't be deleted
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_exercise_library_muscle_group ON exercise_library(muscle_group);
CREATE INDEX idx_exercise_library_equipment ON exercise_library(equipment);

ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view exercise library"
  ON exercise_library FOR SELECT TO authenticated
  USING (true);

-- 3. User Exercise History (for recommendations)
CREATE TABLE user_exercise_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_library(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  
  -- Performance data
  weight_kg NUMERIC(6,2),
  reps INTEGER,
  sets INTEGER,
  rpe NUMERIC(3,1),
  
  -- Calculated 1RM estimate
  estimated_1rm NUMERIC(6,2),
  
  performed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, exercise_id, performed_at)
);

CREATE INDEX idx_user_exercise_history_user ON user_exercise_history(user_id);
CREATE INDEX idx_user_exercise_history_exercise ON user_exercise_history(exercise_id);
CREATE INDEX idx_user_exercise_history_date ON user_exercise_history(performed_at);

ALTER TABLE user_exercise_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercise history"
  ON user_exercise_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise history"
  ON user_exercise_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Seed the exercise library
INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES

-- CHEST (15 exercises)
('Barbell Bench Press', 'Chest', ARRAY['chest', 'front_delts'], ARRAY['triceps'], 'barbell', 'intermediate',
 'The king of chest exercises. Lie flat on a bench and press the bar from chest to lockout.',
 'Allows the heaviest loading of the chest muscles. Compound movement builds mass and strength.',
 ARRAY['Keep feet planted for stability', 'Slight arch in lower back', 'Touch bar to mid-chest'],
 ARRAY['Bouncing bar off chest', 'Flaring elbows too wide', 'Lifting hips off bench'],
 true, false),

('Incline Barbell Bench Press', 'Chest', ARRAY['upper_chest', 'front_delts'], ARRAY['triceps'], 'barbell', 'intermediate',
 'Bench set to 30-45 degree angle. Targets upper chest for complete development.',
 'Essential for balanced chest development. Upper chest is often underdeveloped.',
 ARRAY['30-45 degree angle optimal', 'Touch bar to upper chest/clavicle', 'Don''t set bench too steep'],
 ARRAY['Setting bench too steep (becomes shoulder press)', 'Dropping chest at bottom', 'Half reps'],
 true, false),

('Dumbbell Bench Press', 'Chest', ARRAY['chest', 'front_delts'], ARRAY['triceps'], 'dumbbell', 'beginner',
 'Press dumbbells from chest level to full extension. Greater range of motion than barbell.',
 'Better range of motion and each arm works independently, fixing imbalances.',
 ARRAY['Start with dumbbells at chest level', 'Press in an arc toward midline', 'Full stretch at bottom'],
 ARRAY['Not going deep enough', 'Bringing dumbbells together at top', 'Uncontrolled lowering'],
 true, false),

('Incline Dumbbell Press', 'Chest', ARRAY['upper_chest', 'front_delts'], ARRAY['triceps'], 'dumbbell', 'beginner',
 'Dumbbell press on an incline bench. Excellent for upper chest thickness.',
 'Combines upper chest targeting with dumbbell benefits. Great for muscle growth.',
 ARRAY['Elbows at 45-60 degrees', 'Squeeze chest at top', 'Control the descent'],
 ARRAY['Too steep angle', 'Bending wrists', 'Using momentum'],
 true, false),

('Dumbbell Flyes', 'Chest', ARRAY['chest'], ARRAY['front_delts'], 'dumbbell', 'intermediate',
 'Arms extended, arc dumbbells down and up like hugging a tree.',
 'Maximum chest stretch and isolation. Great for width and detail.',
 ARRAY['Slight bend in elbows throughout', 'Stretch at bottom, squeeze at top', 'Keep wrists straight'],
 ARRAY['Bending elbows too much (becomes press)', 'Going too heavy', 'Losing shoulder position'],
 false, true),

('Cable Flyes (High to Low)', 'Chest', ARRAY['lower_chest'], ARRAY['chest', 'front_delts'], 'cable', 'beginner',
 'Cables set high, bring hands down and together in front of hips.',
 'Constant tension throughout range. Targets lower chest fibers.',
 ARRAY['Step forward for tension at bottom', 'Squeeze hard at contraction', 'Control the negative'],
 ARRAY['Using too much weight', 'Not stepping forward enough', 'Bending elbows excessively'],
 false, true),

('Cable Flyes (Low to High)', 'Chest', ARRAY['upper_chest'], ARRAY['chest', 'front_delts'], 'cable', 'beginner',
 'Cables set low, bring hands up and together in front of chest.',
 'Great for upper chest without shoulder stress of incline pressing.',
 ARRAY['Lean slightly forward', 'Bring hands together at face height', 'Focus on upper chest contraction'],
 ARRAY['Standing too upright', 'Going too heavy', 'Not controlling the negative'],
 false, true),

('Machine Chest Press', 'Chest', ARRAY['chest'], ARRAY['front_delts', 'triceps'], 'machine', 'beginner',
 'Seated chest press machine. Safe and controlled movement.',
 'Good for beginners or when fatigued. Fixed path reduces injury risk.',
 ARRAY['Adjust seat so handles align with mid-chest', 'Full range of motion', 'Don''t lock out elbows hard'],
 ARRAY['Seat too high or low', 'Partial reps', 'Using momentum'],
 false, false),

('Pec Deck / Pec Deck Fly', 'Chest', ARRAY['chest'], ARRAY['front_delts'], 'machine', 'beginner',
 'Sit facing machine, bring arms together in front of chest.',
 'Excellent chest isolation. Great for learning to feel chest muscles work.',
 ARRAY['Keep elbows at chest height', 'Squeeze at contraction', 'Control the negative'],
 ARRAY['Using too much weight', 'Letting elbows drop', 'Partial range of motion'],
 false, true),

('Push-Ups', 'Chest', ARRAY['chest', 'front_delts'], ARRAY['triceps', 'core'], 'bodyweight', 'beginner',
 'Classic bodyweight exercise. Lower chest to floor, push back up.',
 'Most accessible chest exercise. Can be done anywhere, scalable difficulty.',
 ARRAY['Keep body straight like plank', 'Full range of motion', 'Elbows at 45 degrees'],
 ARRAY['Hips sagging', 'Half reps', 'Flaring elbows too wide'],
 true, false),

('Weighted Push-Ups', 'Chest', ARRAY['chest', 'front_delts'], ARRAY['triceps', 'core'], 'bodyweight', 'intermediate',
 'Push-ups with weight plate on back or resistance band.',
 'Progressive overload for push-ups when bodyweight becomes too easy.',
 ARRAY['Have partner place weight on upper back', 'Keep core tight', 'Don''t let hips sag under load'],
 ARRAY['Too much weight compromising form', 'Incomplete range of motion', 'Losing core tightness'],
 true, false),

('Dips (Chest Focus)', 'Chest', ARRAY['lower_chest'], ARRAY['triceps', 'front_delts'], 'bodyweight', 'intermediate',
 'Lean forward on parallel bars to emphasize chest over triceps.',
 'Excellent lower chest and overall chest mass builder.',
 ARRAY['Lean forward 30-45 degrees', 'Lower until shoulders are below elbows', 'Push through chest'],
 ARRAY['Staying too upright (becomes tricep dip)', 'Going too deep and risking shoulder', 'Kipping'],
 true, false),

('Svend Press', 'Chest', ARRAY['chest'], ARRAY['front_delts'], 'dumbbell', 'beginner',
 'Hold single dumbbell plate between palms, press outward while squeezing.',
 'Great activation exercise and chest finisher. No equipment needed.',
 ARRAY['Squeeze plate hard between hands', 'Press outward while pushing hands together', 'Hold contraction'],
 ARRAY['Using too heavy a plate', 'Not squeezing', 'Treating it like a real press'],
 false, true),

('Landmine Press', 'Chest', ARRAY['chest', 'front_delts'], ARRAY['triceps'], 'barbell', 'intermediate',
 'One end of barbell in landmine attachment, press other end up at angle.',
 'Natural arc motion, shoulder-friendly. Good for upper chest.',
 ARRAY['Stand in staggered stance', 'Press up and toward midline', 'Control the negative'],
 ARRAY['Using legs too much', 'Not controlling the arc', 'Wrong angle'),
 true, false),

('Deficit Push-Ups', 'Chest', ARRAY['chest'], ARRAY['front_delts', 'triceps'], 'bodyweight', 'intermediate',
 'Hands elevated on blocks/books for deeper stretch at bottom.',
 'Increased range of motion for greater chest stretch and growth.',
 ARRAY['Lower chest below hand level', 'Maintain plank position', 'Full extension at top'],
 ARRAY['Losing core position for depth', 'Not controlling the bottom', 'Partial reps at top'];

-- BACK (15 exercises) - Will continue in batches
