-- =============================================
-- Migration 008: Populate Program Workouts with Exercises
-- Link program templates to exercise_library
-- =============================================

-- =============================================
-- FULL BODY PROGRAM - Week 1 (Accumulation)
-- =============================================

-- Workout 1: Day A
INSERT INTO program_workouts (program_id, week_id, workout_number, name, focus, target_duration_minutes, rpe_target)
SELECT 
  'fullbody',
  pw.id,
  1,
  'Full Body A',
  'Squat emphasis, horizontal push/pull',
  50,
  7
FROM program_weeks pw
WHERE pw.program_id = 'fullbody' AND pw.week_number = 1;

-- Workout 2: Day B
INSERT INTO program_workouts (program_id, week_id, workout_number, name, focus, target_duration_minutes, rpe_target)
SELECT 
  'fullbody',
  pw.id,
  2,
  'Full Body B',
  'Hinge emphasis, vertical push/pull',
  50,
  7
FROM program_weeks pw
WHERE pw.program_id = 'fullbody' AND pw.week_number = 1;

-- Workout 3: Day C
INSERT INTO program_workouts (program_id, week_id, workout_number, name, focus, target_duration_minutes, rpe_target)
SELECT 
  'fullbody',
  pw.id,
  3,
  'Full Body C',
  'Unilateral and core focus',
  45,
  7
FROM program_weeks pw
WHERE pw.program_id = 'fullbody' AND pw.week_number = 1;

-- =============================================
-- Add Exercises to Full Body Workout 1 (Day A)
-- =============================================

-- Get workout IDs for Full Body Week 1
WITH week1_workouts AS (
  SELECT pw.id as workout_id, pw.workout_number
  FROM program_workouts pw
  JOIN program_weeks pweek ON pw.week_id = pweek.id
  WHERE pweek.program_id = 'fullbody' AND pweek.week_number = 1
)

-- Workout 1 (Day A): Barbell Back Squat - 4x8-10
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, intensity_percent_1rm, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Barbell Back Squat'),
  4,
  '8-10',
  70,
  7,
  180,
  1,
  'Focus on depth and control. Keep chest up, drive through heels.'
FROM week1_workouts w
WHERE w.workout_number = 1;

-- Workout 1: Dumbbell Bench Press - 3x10-12
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, intensity_percent_1rm, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Dumbbell Bench Press'),
  3,
  '10-12',
  NULL,
  7,
  120,
  2,
  'Full range of motion. Squeeze at the top. Control the negative.'
FROM week1_workouts w
WHERE w.workout_number = 1;

-- Workout 1: Barbell Bent-Over Row - 3x10-12
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, intensity_percent_1rm, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Barbell Bent-Over Row'),
  3,
  '10-12',
  NULL,
  7,
  120,
  3,
  'Hinge at hips, pull to lower chest. Squeeze shoulder blades.'
FROM week1_workouts w
WHERE w.workout_number = 1;

-- Workout 1: Dumbbell Shoulder Press - 3x10-12
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, intensity_percent_1rm, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Seated Dumbbell Press'),
  3,
  '10-12',
  NULL,
  7,
  120,
  4,
  'Press in slight arc. Don\'t arch lower back excessively.'
FROM week1_workouts w
WHERE w.workout_number = 1;

-- Workout 1: Plank - 3x45-60 seconds
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Plank'),
  3,
  '45-60 sec',
  6,
  60,
  5,
  'Body straight like a plank. Don\'t let hips sag. Breathe normally.'
FROM week1_workouts w
WHERE w.workout_number = 1;

-- =============================================
-- Add Exercises to Full Body Workout 2 (Day B)
-- =============================================

-- Workout 2 (Day B): Barbell Deadlift - 3x6-8
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, intensity_percent_1rm, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Barbell Deadlift'),
  3,
  '6-8',
  75,
  7,
  240,
  1,
  'Keep bar close to shins. Neutral spine. Hinge at hips.'
FROM week1_workouts w
WHERE w.workout_number = 2;

-- Workout 2: Lat Pulldown - 3x10-12
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Lat Pulldown'),
  3,
  '10-12',
  7,
  120,
  2,
  'Pull to upper chest. Drive elbows down and back. Squeeze lats.'
FROM week1_workouts w
WHERE w.workout_number = 2;

-- Workout 2: Incline Dumbbell Press - 3x10-12
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Incline Dumbbell Press'),
  3,
  '10-12',
  7,
  120,
  3,
  '30-45 degree angle. Upper chest emphasis. Control the descent.'
FROM week1_workouts w
WHERE w.workout_number = 2;

-- Workout 2: Face Pull - 3x15-20
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Rope Face Pull'),
  3,
  '15-20',
  6,
  90,
  4,
  'Pull to forehead level. Externally rotate at the end. Light weight, high quality.'
FROM week1_workouts w
WHERE w.workout_number = 2;

-- Workout 2: Hanging Leg Raise - 3x10-15
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Hanging Leg Raise'),
  3,
  '10-15',
  7,
  90,
  5,
  'Control the swing. Lift legs to at least 90 degrees. Lower slowly.'
FROM week1_workouts w
WHERE w.workout_number = 2;

-- =============================================
-- Add Exercises to Full Body Workout 3 (Day C)
-- =============================================

-- Workout 3 (Day C): Goblet Squat - 3x12-15
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Goblet Squat'),
  3,
  '12-15',
  6,
  120,
  1,
  'Hold dumbbell at chest. Deep squat position. Great for mobility.'
FROM week1_workouts w
WHERE w.workout_number = 3;

-- Workout 3: Romanian Deadlift - 3x10-12
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Romanian Deadlift'),
  3,
  '10-12',
  7,
  120,
  2,
  'Soft knees, hinge at hips. Feel hamstring stretch. Bar close to legs.'
FROM week1_workouts w
WHERE w.workout_number = 3;

-- Workout 3: Dumbbell Row - 3x10-12 per arm
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Dumbbell Row'),
  3,
  '10-12',
  7,
  90,
  3,
  'Pull to hip, not chest. Support with other hand. Squeeze lat at top.'
FROM week1_workouts w
WHERE w.workout_number = 3;

-- Workout 3: Push-Ups - 3xAMRAP
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Push-Ups'),
  3,
  'AMRAP',
  7,
  90,
  4,
  'As Many Reps As Possible. Full range. Body straight like plank.'
FROM week1_workouts w
WHERE w.workout_number = 3;

-- Workout 3: Lateral Raise - 3x15-20
INSERT INTO program_exercises (workout_id, exercise_library_id, sets, reps, rpe_target, rest_seconds, exercise_order, coaching_notes)
SELECT 
  w.workout_id,
  (SELECT id FROM exercise_library WHERE name = 'Dumbbell Lateral Raise'),
  3,
  '15-20',
  6,
  60,
  5,
  'Lead with elbows. Raise to shoulder height. Light weight, controlled.'
FROM week1_workouts w
WHERE w.workout_number = 3;

-- =============================================
-- Copy Week 1 structure to Weeks 2-4 (same exercises, progressive overload)
-- In real implementation, we would adjust sets/reps/weight for progression
-- =============================================

-- Note: For now, weeks 2-4 will have the same structure
-- Users should increase weight when they can complete all sets at the top of the rep range

SELECT 'Full Body Week 1 populated with exercises' as status;
