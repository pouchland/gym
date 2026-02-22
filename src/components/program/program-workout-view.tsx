"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserStats } from "@/lib/hooks/use-user-stats";

interface ProgramExercise {
  id: string;
  sets: number;
  reps: string;
  intensity_percent_1rm: number | null;
  rpe_target: number | null;
  rest_seconds: number | null;
  exercise_order: number;
  coaching_notes: string | null;
  exercise: {
    id: string;
    name: string;
    muscle_group: string;
    equipment: string;
    pro_tips: string[];
  } | null;
}

interface ProgramWorkout {
  id: string;
  workout_number: number;
  name: string;
  focus: string;
  target_duration_minutes: number | null;
  rpe_target: number | null;
}

export function ProgramWorkoutView() {
  const { stats } = useUserStats();
  const [workout, setWorkout] = useState<ProgramWorkout | null>(null);
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const currentWeek = stats?.current_week || 1;
  const currentWorkout = stats?.current_workout_number || 1;

  useEffect(() => {
    if (!stats?.current_program) return;
    fetchWorkout();
  }, [stats]);

  const fetchWorkout = async () => {
    setLoading(true);

    // Get the current week's workout
    const { data: weekData } = await supabase
      .from("program_weeks")
      .select("id")
      .eq("program_id", stats?.current_program)
      .eq("week_number", currentWeek)
      .single();

    if (!weekData) {
      setLoading(false);
      return;
    }

    // Get the workout for this week
    const { data: workoutData } = await supabase
      .from("program_workouts")
      .select("*")
      .eq("week_id", weekData.id)
      .eq("workout_number", currentWorkout)
      .single();

    if (!workoutData) {
      setLoading(false);
      return;
    }

    setWorkout(workoutData);

    // Get exercises for this workout
    const { data: exercisesData } = await supabase
      .from("program_exercises")
      .select(`
        *,
        exercise:exercise_library_id (
          id,
          name,
          muscle_group,
          equipment,
          pro_tips
        )
      `)
      .eq("workout_id", workoutData.id)
      .order("exercise_order");

    setExercises(exercisesData || []);
    setLoading(false);
  };

  if (loading) return <div className="p-4">Loading workout...</div>;

  if (!workout) {
    return (
      <div className="p-4 text-center">
        <p className="text-zinc-500">No workout found for this week.</p>
        <Link
          href="/workout"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Start Custom Workout
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{workout.name}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Week {currentWeek} · Workout {currentWorkout}
          {workout.focus && ` · ${workout.focus}`}
        </p>
      </div>

      {/* Workout Stats */}
      <div className="flex gap-4">
        {workout.target_duration_minutes && (
          <div className="rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
            <p className="text-xs text-zinc-500">Duration</p>
            <p className="font-semibold">~{workout.target_duration_minutes} min</p>
          </div>
        )}
        {workout.rpe_target && (
          <div className="rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
            <p className="text-xs text-zinc-500">Target RPE</p>
            <p className="font-semibold">{workout.rpe_target}/10</p>
          </div>
        )}
        <div className="rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500">Exercises</p>
          <p className="font-semibold">{exercises.length}</p>
        </div>
      </div>

      {/* Start Button */}
      <Link
        href={`/workout/start?program=${stats?.current_program}&week=${currentWeek}&workout=${currentWorkout}`}
        className="block w-full rounded-xl bg-blue-600 py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Start Workout
      </Link>

      {/* Exercise List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Exercises</h2>
        
        {exercises.map((ex, index) => (
          <div
            key={ex.id}
            className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{ex.exercise?.name || "Exercise"}</h3>
                  {ex.exercise?.equipment && (
                    <span className="text-xs text-zinc-500">
                      {ex.exercise.equipment}
                    </span>
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {ex.sets} sets
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {ex.reps} reps
                  </span>
                  {ex.intensity_percent_1rm && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                      {ex.intensity_percent_1rm}% 1RM
                    </span>
                  )}
                  {ex.rpe_target && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                      RPE {ex.rpe_target}
                    </span>
                  )}
                  {ex.rest_seconds && (
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      Rest {Math.floor(ex.rest_seconds / 60)}:{(ex.rest_seconds % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
                
                {ex.coaching_notes && (
                  <div className="mt-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      💡 {ex.coaching_notes}
                    </p>
                  </div>
                )}
                
                {ex.exercise?.pro_tips && ex.exercise.pro_tips.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-zinc-500">Pro Tips:</p>
                    <ul className="mt-1 space-y-1">
                      {ex.exercise.pro_tips.slice(0, 2).map((tip, i) => (
                        <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
