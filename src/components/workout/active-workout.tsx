"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ExercisePicker } from "./exercise-picker";
import { SetRow } from "./set-row";
import type { Exercise } from "@/types/database";

interface WorkoutExercise {
  exercise: Exercise;
  sets: {
    id: string;
    reps: number | null;
    weight: number | null;
    completed: boolean;
  }[];
}

interface ActiveWorkoutProps {
  exercises: Exercise[];
}

export function ActiveWorkout({ exercises }: ActiveWorkoutProps) {
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const startWorkout = useCallback(async () => {
    // user_id is set automatically by database default (auth.uid())
    const { data, error } = await supabase
      .from("workouts")
      .insert({ name: workoutName || "Workout" })
      .select("id")
      .single();

    if (error || !data) return;
    setWorkoutId(data.id);
  }, [supabase, workoutName]);

  const addExercise = useCallback(
    (exercise: Exercise) => {
      setWorkoutExercises((prev) => [
        ...prev,
        {
          exercise,
          sets: [
            { id: crypto.randomUUID(), reps: null, weight: null, completed: false },
          ],
        },
      ]);
    },
    []
  );

  const addSet = useCallback((exerciseIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((we, i) =>
        i === exerciseIndex
          ? {
              ...we,
              sets: [
                ...we.sets,
                {
                  id: crypto.randomUUID(),
                  reps: null,
                  weight: null,
                  completed: false,
                },
              ],
            }
          : we
      )
    );
  }, []);

  const updateSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      data: { reps?: number | null; weight?: number | null }
    ) => {
      setWorkoutExercises((prev) =>
        prev.map((we, i) =>
          i === exerciseIndex
            ? {
                ...we,
                sets: we.sets.map((s, si) =>
                  si === setIndex ? { ...s, ...data } : s
                ),
              }
            : we
        )
      );
    },
    []
  );

  const toggleSetComplete = useCallback(
    async (exerciseIndex: number, setIndex: number) => {
      const exercise = workoutExercises[exerciseIndex];
      const set = exercise.sets[setIndex];

      if (!set.completed && workoutId) {
        // Save to database when completing a set
        const { error } = await supabase.from("workout_sets").insert({
          workout_id: workoutId,
          exercise_id: exercise.exercise.id,
          set_number: setIndex + 1,
          reps: set.reps,
          weight: set.weight,
        });
        if (error) {
          console.error("Failed to save set:", error);
          return;
        }
      }

      setWorkoutExercises((prev) =>
        prev.map((we, i) =>
          i === exerciseIndex
            ? {
                ...we,
                sets: we.sets.map((s, si) =>
                  si === setIndex ? { ...s, completed: !s.completed } : s
                ),
              }
            : we
        )
      );
    },
    [workoutExercises, workoutId, supabase]
  );

  const removeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      setWorkoutExercises((prev) =>
        prev.map((we, i) =>
          i === exerciseIndex
            ? { ...we, sets: we.sets.filter((_, si) => si !== setIndex) }
            : we
        )
      );
    },
    []
  );

  const removeExercise = useCallback((exerciseIndex: number) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!workoutId) return;
    setSaving(true);

    const { error } = await supabase
      .from("workouts")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", workoutId);

    if (error) {
      console.error("Failed to finish workout:", error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/workout/${workoutId}`);
    router.refresh();
  }, [workoutId, supabase, router]);

  const cancelWorkout = useCallback(async () => {
    if (!workoutId) return;

    const { error: setsError } = await supabase.from("workout_sets").delete().eq("workout_id", workoutId);
    if (setsError) {
      console.error("Failed to delete workout sets:", setsError);
      return;
    }
    const { error: workoutError } = await supabase.from("workouts").delete().eq("id", workoutId);
    if (workoutError) {
      console.error("Failed to delete workout:", workoutError);
      return;
    }

    setWorkoutId(null);
    setWorkoutExercises([]);
    setWorkoutName("");
  }, [workoutId, supabase]);

  // Pre-workout screen
  if (!workoutId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Start Workout</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Name your workout and start logging
          </p>
        </div>

        <input
          type="text"
          placeholder="Workout name (e.g., Push Day)"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
        />

        <button
          onClick={startWorkout}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          Start Empty Workout
        </button>
      </div>
    );
  }

  // Active workout screen
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {workoutName || "Workout"}
        </h1>
        <button
          onClick={cancelWorkout}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
        >
          Cancel
        </button>
      </div>

      {workoutExercises.map((we, exerciseIndex) => (
        <div
          key={`${we.exercise.id}-${exerciseIndex}`}
          className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{we.exercise.name}</h3>
              {we.exercise.muscle_group && (
                <p className="text-xs text-zinc-500">
                  {we.exercise.muscle_group}
                </p>
              )}
            </div>
            <button
              onClick={() => removeExercise(exerciseIndex)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          <div className="mb-2 flex items-center gap-2 px-3 text-xs font-medium text-zinc-400">
            <span className="w-8 text-center">SET</span>
            <div className="flex flex-1 items-center gap-2">
              <span className="flex-1 text-center">LBS</span>
              <span className="w-4" />
              <span className="flex-1 text-center">REPS</span>
            </div>
            <span className="w-10" />
          </div>

          <div className="space-y-2">
            {we.sets.map((set, setIndex) => (
              <SetRow
                key={set.id}
                setNumber={setIndex + 1}
                reps={set.reps}
                weight={set.weight}
                completed={set.completed}
                onUpdate={(data) => updateSet(exerciseIndex, setIndex, data)}
                onToggleComplete={() =>
                  toggleSetComplete(exerciseIndex, setIndex)
                }
                onRemove={() => removeSet(exerciseIndex, setIndex)}
              />
            ))}
          </div>

          <button
            onClick={() => addSet(exerciseIndex)}
            className="mt-2 w-full rounded-lg py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            + Add Set
          </button>
        </div>
      ))}

      <button
        onClick={() => setShowPicker(true)}
        className="w-full rounded-xl border-2 border-dashed border-zinc-300 py-4 text-base font-medium text-zinc-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500"
      >
        + Add Exercise
      </button>

      {workoutExercises.length > 0 && (
        <button
          onClick={finishWorkout}
          disabled={saving}
          className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Finish Workout"}
        </button>
      )}

      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
