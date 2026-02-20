export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  user_id: string | null;
  name: string;
  muscle_group: string | null;
  is_custom: boolean;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string | null;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
}

// Joined types for queries
export interface WorkoutSetWithExercise extends WorkoutSet {
  exercises: Pick<Exercise, "name" | "muscle_group">;
}

export interface WorkoutWithSets extends Workout {
  workout_sets: WorkoutSetWithExercise[];
}
