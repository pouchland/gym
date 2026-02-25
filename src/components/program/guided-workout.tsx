"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserStats } from "@/lib/hooks/use-user-stats";
import {
  useProgramWorkoutExercises,
  useProgramTemplate,
  type ProgramExercise,
} from "@/lib/hooks/use-program-templates";
import Link from "next/link";

interface WorkoutSet {
  id: string;
  exerciseIndex: number;
  setNumber: number;
  targetReps: string;
  targetWeight: number | null;
  actualReps: number | null;
  actualWeight: number | null;
  rpe: number | null;
  completed: boolean;
  notes: string;
}

interface ActiveExercise {
  programExercise: ProgramExercise;
  name: string;
  sets: WorkoutSet[];
}

export function GuidedWorkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const week = Number(searchParams.get("week")) || 1;
  const workoutNum = Number(searchParams.get("workout")) || 1;
  const { stats, updateStats } = useUserStats();
  const supabase = createClient();

  const programId = stats?.current_program || null;
  const { template } = useProgramTemplate(programId);
  const { workout, week: weekData, exercises, loading, error } =
    useProgramWorkoutExercises(programId, week, workoutNum);

  const [isPending, startTransition] = useTransition();
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [workoutError, setWorkoutError] = useState<string | null>(null);

  // Build active exercises from DB program exercises
  useEffect(() => {
    if (!exercises || exercises.length === 0) return;

    const active: ActiveExercise[] = exercises.map((ex, exIndex) => {
      const numSets = ex.sets;
      const name = ex.exercise_library?.name || `Exercise ${exIndex + 1}`;

      return {
        programExercise: ex,
        name,
        sets: Array.from({ length: numSets }, (_, setIndex) => ({
          id: crypto.randomUUID(),
          exerciseIndex: exIndex,
          setNumber: setIndex + 1,
          targetReps: ex.reps || "8-12",
          targetWeight: null, // User enters their weight
          actualReps: null,
          actualWeight: null,
          rpe: null,
          completed: false,
          notes: "",
        })),
      };
    });

    setActiveExercises(active);
  }, [exercises]);

  // Rest timer countdown
  useEffect(() => {
    if (!showRestTimer || restSeconds <= 0) return;

    const timer = setInterval(() => {
      setRestSeconds((s) => {
        if (s <= 1) {
          setShowRestTimer(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showRestTimer, restSeconds]);

  const startWorkout = useCallback(() => {
    if (!workout) return;

    startTransition(async () => {
      const { data, error } = await supabase
        .from("workouts")
        .insert({
          name: `${template?.name || "Program"} — Week ${week} Workout ${workoutNum}: ${workout.name}`,
        })
        .select("id")
        .single();

      if (error || !data) {
        setWorkoutError("Failed to start workout. Please try again.");
        return;
      }

      setWorkoutId(data.id);
      setWorkoutStarted(true);
    });
  }, [supabase, week, workoutNum, workout, template]);

  const saveSet = useCallback(() => {
    const currentExercise = activeExercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets[currentSetIndex];

    if (!currentSet || !workoutId) return;

    startTransition(async () => {
      const { error } = await supabase.from("workout_sets").insert({
        workout_id: workoutId,
        exercise_id: currentExercise.programExercise.exercise_library_id,
        set_number: currentSet.setNumber,
        reps: currentSet.actualReps,
        weight: currentSet.actualWeight,
        rpe: currentSet.rpe,
        notes: `${currentExercise.name}${currentSet.notes ? ` — ${currentSet.notes}` : ""}`,
      });
      if (error) {
        setWorkoutError(`Failed to save set: ${error.message}`);
        return;
      }

      // Update local state
      setActiveExercises((prev) =>
        prev.map((ex, exI) =>
          exI === currentExerciseIndex
            ? {
                ...ex,
                sets: ex.sets.map((s, sI) =>
                  sI === currentSetIndex ? { ...s, completed: true } : s
                ),
              }
            : ex
        )
      );

      // Start rest timer
      const restTime = currentExercise.programExercise.rest_seconds || 120;
      setRestSeconds(restTime);
      setShowRestTimer(true);

      // Move to next set or exercise
      if (currentSetIndex < currentExercise.sets.length - 1) {
        setCurrentSetIndex((prev) => prev + 1);
      } else if (currentExerciseIndex < activeExercises.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSetIndex(0);
      }
    });
  }, [activeExercises, currentExerciseIndex, currentSetIndex, workoutId, supabase]);

  const updateSetData = (field: keyof WorkoutSet, value: number | string) => {
    setActiveExercises((prev) =>
      prev.map((ex, exI) =>
        exI === currentExerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, sI) =>
                sI === currentSetIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const finishWorkout = useCallback(() => {
    if (!workoutId) return;
    setSaving(true);

    startTransition(async () => {
      const { error: finishError } = await supabase
        .from("workouts")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", workoutId);

      if (finishError) {
        setWorkoutError("Failed to finish workout. Please try again.");
        setSaving(false);
        return;
      }

      // Advance to next workout
      const totalWorkoutsPerWeek = template?.days_per_week || 3;
      let nextWorkout = workoutNum + 1;
      let nextWeek = week;

      if (nextWorkout > totalWorkoutsPerWeek) {
        nextWorkout = 1;
        nextWeek = Math.min(week + 1, template?.duration_weeks || 12);
      }

      await updateStats({
        current_week: nextWeek,
        current_workout_number: nextWorkout,
      });

      setSaving(false);
      router.push("/");
    });
  }, [workoutId, supabase, router, week, workoutNum, updateStats, template]);

  // Loading state
  if (loading) {
    return <div className="p-4">Loading workout...</div>;
  }

  // No valid program selected
  if (!programId || programId === "bench_press_specialization") {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">No Program Selected</h1>
        <p className="text-zinc-500">
          You need to select a training program before starting a guided workout.
        </p>
        <Link
          href="/onboarding"
          className="block w-full rounded-lg bg-blue-600 py-3 text-center text-white font-medium"
        >
          Set Up Program
        </Link>
      </div>
    );
  }

  // No exercises found
  if (error || !workout || exercises.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">Workout Not Available</h1>
        <p className="text-zinc-500">
          {error || "No exercises found for this workout. The program data may not be fully set up."}
        </p>
        <Link
          href="/workout"
          className="block w-full rounded-lg bg-zinc-200 py-3 text-center text-zinc-700 font-medium dark:bg-zinc-800 dark:text-zinc-300"
        >
          Back to Workouts
        </Link>
      </div>
    );
  }

  // Error banner
  const ErrorBanner = workoutError ? (
    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
      {workoutError}
      <button
        onClick={() => setWorkoutError(null)}
        className="ml-2 underline"
      >
        Dismiss
      </button>
    </div>
  ) : null;

  // Pre-workout screen
  if (!workoutStarted) {
    return (
      <div className="space-y-6">
        {ErrorBanner}
        <div>
          <h1 className="text-2xl font-bold">Week {week} · Workout {workoutNum}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {weekData?.phase || "Training"} · {workout.name}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Focus
            </span>
            <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {workout.focus || "General"}
            </span>
          </div>
          {workout.rpe_target && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Target RPE
              </span>
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {workout.rpe_target}
              </span>
            </div>
          )}
          {workout.target_duration_minutes && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Est. Duration
              </span>
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {workout.target_duration_minutes} min
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Exercises</h2>
          {exercises.map((ex, i) => (
            <div key={ex.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {ex.exercise_library?.name || `Exercise ${i + 1}`}
                </span>
                <span className="text-sm text-zinc-500">
                  {ex.sets} sets × {ex.reps} reps
                </span>
              </div>
              {ex.intensity_percent_1rm && (
                <p className="text-sm text-zinc-400 mt-1">
                  Target: {ex.intensity_percent_1rm}% of 1RM
                </p>
              )}
              {ex.coaching_notes && (
                <p className="text-xs text-zinc-500 mt-1 italic">{ex.coaching_notes}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={startWorkout}
          disabled={isPending}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Starting..." : "Start Workout"}
        </button>
      </div>
    );
  }

  const currentExercise = activeExercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];
  const isLastSet =
    currentExerciseIndex === activeExercises.length - 1 &&
    currentSetIndex === currentExercise?.sets.length - 1;

  return (
    <div className="space-y-4">
      {ErrorBanner}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{currentExercise?.name}</h1>
          <p className="text-sm text-zinc-500">
            Set {currentSetIndex + 1} of {currentExercise?.sets.length} ·
            Exercise {currentExerciseIndex + 1} of {activeExercises.length}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${(() => {
              const completedSets = activeExercises
                .slice(0, currentExerciseIndex)
                .reduce((sum, ex) => sum + ex.sets.length, 0) + currentSetIndex;
              const totalSets = activeExercises.reduce(
                (sum, ex) => sum + ex.sets.length,
                0
              );
              return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
            })()}%`,
          }}
        />
      </div>

      {/* Rest Timer Overlay */}
      {showRestTimer && restSeconds > 0 && (
        <div className="rounded-xl bg-orange-50 p-6 text-center dark:bg-orange-950">
          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
            Rest Time
          </p>
          <p className="text-5xl font-bold text-orange-900 dark:text-orange-100 my-2">
            {Math.floor(restSeconds / 60)}:
            {(restSeconds % 60).toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
            Next:{" "}
            {isLastSet
              ? "Finish workout"
              : currentSetIndex < (currentExercise?.sets.length || 0) - 1
                ? "Next set"
                : "Next exercise"}
          </p>
          <button
            onClick={() => {
              setShowRestTimer(false);
              setRestSeconds(0);
            }}
            className="rounded-lg bg-orange-200 px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800"
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Active Set Card */}
      {!showRestTimer && currentSet && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900 space-y-6">
          {/* Recommendation */}
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-1">Target</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {currentSet.targetReps} reps
            </p>
            {currentExercise.programExercise.intensity_percent_1rm && (
              <p className="text-sm text-zinc-500 mt-1">
                @ {currentExercise.programExercise.intensity_percent_1rm}% of 1RM
              </p>
            )}
            {currentExercise.programExercise.rpe_target && (
              <p className="text-sm text-zinc-500">
                Target RPE: {currentExercise.programExercise.rpe_target}
              </p>
            )}
            {currentExercise.programExercise.rest_seconds && (
              <p className="text-sm text-zinc-500">
                Rest:{" "}
                {Math.floor(currentExercise.programExercise.rest_seconds / 60)}:
                {(currentExercise.programExercise.rest_seconds % 60)
                  .toString()
                  .padStart(2, "0")}
              </p>
            )}
          </div>

          {/* Actual Performance Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Weight (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={currentSet.actualWeight || ""}
                onChange={(e) =>
                  updateSetData("actualWeight", Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-2xl font-bold text-center outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Reps
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={currentSet.actualReps || ""}
                onChange={(e) =>
                  updateSetData("actualReps", Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-2xl font-bold text-center outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          {/* RPE Selector */}
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 block mb-2">
              Actual RPE
            </label>
            <div className="flex gap-2 justify-center">
              {[5, 6, 7, 8, 9, 10].map((rpe) => (
                <button
                  key={rpe}
                  onClick={() => updateSetData("rpe", rpe)}
                  className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                    currentSet.rpe === rpe
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {rpe}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={currentSet.notes}
              onChange={(e) => updateSetData("notes", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          {/* Coaching Notes */}
          {currentExercise.programExercise.coaching_notes && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                Coaching Tip
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {currentExercise.programExercise.coaching_notes}
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={saveSet}
            disabled={!currentSet.actualReps || !currentSet.actualWeight || isPending}
            className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? "Saving..."
              : isLastSet
                ? "Complete Final Set"
                : "Complete Set"}
          </button>
        </div>
      )}

      {/* Finish Workout Button */}
      {isLastSet && currentSet?.completed && !showRestTimer && (
        <button
          onClick={finishWorkout}
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Finish Workout"}
        </button>
      )}

      {/* Exercise List Summary */}
      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
        <h3 className="text-sm font-medium mb-3">Workout Progress</h3>
        <div className="space-y-2">
          {activeExercises.map((ex, exI) => (
            <div
              key={exI}
              className="flex items-center justify-between text-sm"
            >
              <span
                className={exI === currentExerciseIndex ? "font-semibold" : ""}
              >
                {ex.name}
              </span>
              <span className="text-zinc-500">
                {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} sets
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
