-- Fix workout_sets.exercise_id: make nullable and point FK to exercise_library
-- The old FK referenced the simple "exercises" table (migration 001).
-- Program exercises reference "exercise_library" (migration 003/007).
-- Making nullable allows saving sets before exercise lookup is resolved.

ALTER TABLE workout_sets ALTER COLUMN exercise_id DROP NOT NULL;

-- Drop old FK to "exercises" table, add new FK to "exercise_library"
ALTER TABLE workout_sets DROP CONSTRAINT IF EXISTS workout_sets_exercise_id_fkey;
ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_exercise_library_fkey
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(id);
