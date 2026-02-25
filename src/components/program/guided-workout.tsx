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
import {
  weeklySchedule,
  calcWeight,
  programMetadata,
  type Exercise as BenchExercise,
} from "@/lib/bench-press-research";
import Link from "next/link";
import { ExercisePicker, type PickableExercise } from "@/components/workout/exercise-picker";

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
  name: string;
  exerciseLibraryId: string | null;
  restSeconds: number;
  intensityPercent1rm: number | null;
  rpeTarget: number | null;
  coachingNotes: string | null;
  sets: WorkoutSet[];
}

const BENCH_PROGRAM_ID = "bench_press_specialization";

export function GuidedWorkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const week = Number(searchParams.get("week")) || 1;
  const workoutNum = Number(searchParams.get("workout")) || 1;
  const resumeId = searchParams.get("resume");
  const { stats, updateStats } = useUserStats();
  const supabase = createClient();

  const programId = stats?.current_program || null;
  const isBenchProgram = programId === BENCH_PROGRAM_ID;

  // DB program hooks (only used for non-bench programs)
  const { template } = useProgramTemplate(isBenchProgram ? null : programId);
  const {
    workout: dbWorkout,
    week: dbWeekData,
    exercises: dbExercises,
    loading: dbLoading,
    error: dbError,
  } = useProgramWorkoutExercises(isBenchProgram ? null : programId, week, workoutNum);

  const [isPending, startTransition] = useTransition();
  const [workoutId, setWorkoutId] = useState<string | null>(resumeId);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [workoutError, setWorkoutError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [oneRepMax, setOneRepMax] = useState(100);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState<PickableExercise[]>([]);

  // Bench press: get 1RM
  useEffect(() => {
    if (!isBenchProgram) return;
    if (stats?.bench_press_1rm) {
      setOneRepMax(Number(stats.bench_press_1rm));
    } else if (stats?.bench_press_8rm) {
      setOneRepMax(Math.round(Number(stats.bench_press_8rm) * 1.25));
    }
  }, [stats, isBenchProgram]);

  // Build exercises from bench press research data
  useEffect(() => {
    if (!isBenchProgram) return;

    const workoutDayMap: Record<number, string> = { 1: "Monday", 2: "Wednesday", 3: "Friday" };
    const dayName = workoutDayMap[workoutNum];
    const weekData = weeklySchedule.find((w) => w.week === week);
    const dayData = weekData?.days.find((d) => d.dayOfWeek === dayName);

    if (!dayData) {
      setInitializing(false);
      return;
    }

    const active: ActiveExercise[] = dayData.exercises.map((ex, exIndex) => {
      const targetWeight =
        typeof ex.intensityPercent1RM === "number"
          ? calcWeight(ex.intensityPercent1RM, oneRepMax)
          : null;

      return {
        name: ex.name,
        exerciseLibraryId: null,
        restSeconds: ex.restSeconds,
        intensityPercent1rm:
          typeof ex.intensityPercent1RM === "number" ? ex.intensityPercent1RM : null,
        rpeTarget: dayData.rpeTarget,
        coachingNotes: ex.notes || null,
        sets: Array.from({ length: ex.sets }, (_, setIndex) => ({
          id: crypto.randomUUID(),
          exerciseIndex: exIndex,
          setNumber: setIndex + 1,
          targetReps: String(ex.reps),
          targetWeight,
          actualReps: null,
          actualWeight: targetWeight,
          rpe: null,
          completed: false,
          notes: "",
        })),
      };
    });

    setActiveExercises(active);
    setInitializing(false);
  }, [isBenchProgram, week, workoutNum, oneRepMax]);

  // Build exercises from DB program data
  useEffect(() => {
    if (isBenchProgram || !dbExercises || dbExercises.length === 0) return;

    const active: ActiveExercise[] = dbExercises.map((ex, exIndex) => ({
      name: ex.exercise_library?.name || `Exercise ${exIndex + 1}`,
      exerciseLibraryId: ex.exercise_library_id,
      restSeconds: ex.rest_seconds || 120,
      intensityPercent1rm: ex.intensity_percent_1rm,
      rpeTarget: ex.rpe_target,
      coachingNotes: ex.coaching_notes,
      sets: Array.from({ length: ex.sets }, (_, setIndex) => ({
        id: crypto.randomUUID(),
        exerciseIndex: exIndex,
        setNumber: setIndex + 1,
        targetReps: ex.reps || "8-12",
        targetWeight: null,
        actualReps: null,
        actualWeight: null,
        rpe: null,
        completed: false,
        notes: "",
      })),
    }));

    setActiveExercises(active);
    setInitializing(false);
  }, [isBenchProgram, dbExercises]);

  // Mark DB loading done for non-bench programs
  useEffect(() => {
    if (!isBenchProgram && !dbLoading) {
      setInitializing(false);
    }
  }, [isBenchProgram, dbLoading]);

  // Resume: load completed sets and advance position
  useEffect(() => {
    if (!resumeId || activeExercises.length === 0) return;

    const loadCompletedSets = async () => {
      const { data: savedSets } = await supabase
        .from("workout_sets")
        .select("*")
        .eq("workout_id", resumeId)
        .order("created_at");

      if (!savedSets || savedSets.length === 0) {
        setWorkoutStarted(true);
        return;
      }

      // Mark completed sets by matching exercise name from notes + set_number
      const updatedExercises = activeExercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => {
          const match = savedSets.find(
            (saved) =>
              saved.notes?.startsWith(ex.name) && saved.set_number === s.setNumber
          );
          if (match) {
            return {
              ...s,
              completed: true,
              actualReps: match.reps,
              actualWeight: match.weight ? Number(match.weight) : null,
              rpe: match.rpe ? Number(match.rpe) : null,
            };
          }
          return s;
        }),
      }));

      setActiveExercises(updatedExercises);

      // Find first incomplete set
      for (let exI = 0; exI < updatedExercises.length; exI++) {
        for (let sI = 0; sI < updatedExercises[exI].sets.length; sI++) {
          if (!updatedExercises[exI].sets[sI].completed) {
            setCurrentExerciseIndex(exI);
            setCurrentSetIndex(sI);
            setWorkoutStarted(true);
            return;
          }
        }
      }

      // All sets completed — show finish button
      const lastEx = updatedExercises.length - 1;
      const lastSet = updatedExercises[lastEx].sets.length - 1;
      setCurrentExerciseIndex(lastEx);
      setCurrentSetIndex(lastSet);
      setWorkoutStarted(true);
    };

    loadCompletedSets();
  }, [resumeId, activeExercises.length > 0 ? "ready" : "waiting", supabase]);

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

  // Workout name for DB insert
  const getWorkoutName = () => {
    if (isBenchProgram) {
      const workoutDayMap: Record<number, string> = { 1: "Monday", 2: "Wednesday", 3: "Friday" };
      const dayName = workoutDayMap[workoutNum];
      const weekData = weeklySchedule.find((w) => w.week === week);
      const dayData = weekData?.days.find((d) => d.dayOfWeek === dayName);
      return `Bench Press — Week ${week} Workout ${workoutNum}: ${dayData?.sessionType || "Training"}`;
    }
    return `${template?.name || dbWorkout?.name || "Program"} — Week ${week} Workout ${workoutNum}`;
  };

  const startWorkout = useCallback(() => {
    startTransition(async () => {
      const { data, error } = await supabase
        .from("workouts")
        .insert({ name: getWorkoutName() })
        .select("id")
        .single();

      if (error || !data) {
        setWorkoutError("Failed to start workout. Please try again.");
        return;
      }

      setWorkoutId(data.id);
      setWorkoutStarted(true);
    });
  }, [supabase, week, workoutNum, isBenchProgram, template, dbWorkout]);

  const saveSet = useCallback(() => {
    const currentExercise = activeExercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets[currentSetIndex];

    if (!currentSet || !workoutId) return;

    startTransition(async () => {
      const { error } = await supabase.from("workout_sets").insert({
        workout_id: workoutId,
        exercise_id: currentExercise.exerciseLibraryId,
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
      setRestSeconds(currentExercise.restSeconds);
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

  const openExercisePicker = useCallback(async () => {
    if (libraryExercises.length === 0) {
      const { data } = await supabase
        .from("exercise_library")
        .select("id, name, muscle_group")
        .order("muscle_group")
        .order("name");
      setLibraryExercises(data || []);
    }
    setShowExercisePicker(true);
  }, [libraryExercises, supabase]);

  const addExerciseFromPicker = useCallback(
    (exercise: PickableExercise) => {
      const newExercise: ActiveExercise = {
        name: exercise.name,
        exerciseLibraryId: exercise.id,
        restSeconds: 90,
        intensityPercent1rm: null,
        rpeTarget: null,
        coachingNotes: null,
        sets: Array.from({ length: 3 }, (_, i) => ({
          id: crypto.randomUUID(),
          exerciseIndex: activeExercises.length,
          setNumber: i + 1,
          targetReps: "8-12",
          targetWeight: null,
          actualReps: null,
          actualWeight: null,
          rpe: null,
          completed: false,
          notes: "",
        })),
      };
      setActiveExercises((prev) => [...prev, newExercise]);
    },
    [activeExercises.length]
  );

  const jumpToExercise = (exI: number) => {
    const firstIncomplete = activeExercises[exI].sets.findIndex((s) => !s.completed);
    setCurrentExerciseIndex(exI);
    setCurrentSetIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    setShowRestTimer(false);
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
      const totalWorkoutsPerWeek = isBenchProgram
        ? programMetadata.sessionsPerWeek
        : template?.days_per_week || 3;
      const maxWeeks = isBenchProgram
        ? programMetadata.totalWeeks
        : template?.duration_weeks || 12;

      let nextWorkout = workoutNum + 1;
      let nextWeek = week;

      if (nextWorkout > totalWorkoutsPerWeek) {
        nextWorkout = 1;
        nextWeek = Math.min(week + 1, maxWeeks);
      }

      await updateStats({
        current_week: nextWeek,
        current_workout_number: nextWorkout,
      });

      setSaving(false);
      router.push("/");
    });
  }, [workoutId, supabase, router, week, workoutNum, updateStats, template, isBenchProgram]);

  // Loading state
  if (initializing) {
    return <div className="p-4">Loading workout...</div>;
  }

  // No valid program
  if (!programId) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">No Program Selected</h1>
        <p className="text-zinc-500">
          Select a training program to start guided workouts.
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

  // No exercises found (bench program: invalid week/day; DB program: no data)
  if (activeExercises.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">Workout Not Available</h1>
        <p className="text-zinc-500">
          {dbError || "No exercises found for this workout."}
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
      <button onClick={() => setWorkoutError(null)} className="ml-2 underline">
        Dismiss
      </button>
    </div>
  ) : null;

  // Workout info for pre-workout screen
  const workoutName = isBenchProgram
    ? (() => {
        const dayMap: Record<number, string> = { 1: "Monday", 2: "Wednesday", 3: "Friday" };
        const wk = weeklySchedule.find((w) => w.week === week);
        const day = wk?.days.find((d) => d.dayOfWeek === dayMap[workoutNum]);
        return day?.sessionType ? `${day.sessionType} session` : "Training";
      })()
    : dbWorkout?.name || "Training";

  const workoutPhase = isBenchProgram
    ? weeklySchedule.find((w) => w.week === week)?.phase || "Training"
    : dbWeekData?.phase || "Training";

  const workoutRpe = isBenchProgram
    ? (() => {
        const dayMap: Record<number, string> = { 1: "Monday", 2: "Wednesday", 3: "Friday" };
        const wk = weeklySchedule.find((w) => w.week === week);
        return wk?.days.find((d) => d.dayOfWeek === dayMap[workoutNum])?.rpeTarget;
      })()
    : dbWorkout?.rpe_target;

  const workoutDuration = isBenchProgram
    ? (() => {
        const dayMap: Record<number, string> = { 1: "Monday", 2: "Wednesday", 3: "Friday" };
        const wk = weeklySchedule.find((w) => w.week === week);
        return wk?.days.find((d) => d.dayOfWeek === dayMap[workoutNum])?.estimatedDurationMinutes;
      })()
    : dbWorkout?.target_duration_minutes;

  // Pre-workout screen
  if (!workoutStarted) {
    return (
      <div className="space-y-6">
        {ErrorBanner}
        <div>
          <h1 className="text-2xl font-bold">Week {week} · Workout {workoutNum}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {workoutPhase} · {workoutName}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
          {workoutRpe != null && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Target RPE
              </span>
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {workoutRpe}
              </span>
            </div>
          )}
          {workoutDuration != null && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Est. Duration
              </span>
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {workoutDuration} min
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Exercises</h2>
          {activeExercises.map((ex, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ex.name}</span>
                <span className="text-sm text-zinc-500">
                  {ex.sets.length} sets × {ex.sets[0]?.targetReps} reps
                </span>
              </div>
              {ex.sets[0]?.targetWeight && (
                <p className="text-sm text-zinc-400 mt-1">
                  Target: {ex.sets[0].targetWeight}kg
                  {ex.intensityPercent1rm ? ` (${ex.intensityPercent1rm}% of ${oneRepMax}kg 1RM)` : ""}
                </p>
              )}
              {ex.coachingNotes && (
                <p className="text-xs text-zinc-500 mt-1 italic">{ex.coachingNotes}</p>
              )}
            </div>
          ))}

          <button
            onClick={openExercisePicker}
            className="w-full rounded-lg border-2 border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500"
          >
            + Add Exercise
          </button>
        </div>

        <button
          onClick={startWorkout}
          disabled={isPending}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Starting..." : "Start Workout"}
        </button>

        {showExercisePicker && (
          <ExercisePicker
            exercises={libraryExercises}
            onSelect={addExerciseFromPicker}
            onClose={() => setShowExercisePicker(false)}
          />
        )}
      </div>
    );
  }

  const currentExercise = activeExercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];
  const isLastSetOfCurrent =
    currentExerciseIndex === activeExercises.length - 1 &&
    currentSetIndex === currentExercise?.sets.length - 1;
  const allSetsCompleted = activeExercises.every((ex) =>
    ex.sets.every((s) => s.completed)
  );

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

      {/* Rest Timer */}
      {showRestTimer && restSeconds > 0 && (
        <div className="rounded-xl bg-orange-50 p-6 text-center dark:bg-orange-950">
          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Rest Time</p>
          <p className="text-5xl font-bold text-orange-900 dark:text-orange-100 my-2">
            {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
            Next: {isLastSetOfCurrent ? "Finish workout" : currentSetIndex < (currentExercise?.sets.length || 0) - 1 ? "Next set" : "Next exercise"}
          </p>
          <button
            onClick={() => { setShowRestTimer(false); setRestSeconds(0); }}
            className="rounded-lg bg-orange-200 px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800"
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Active Set Card */}
      {!showRestTimer && currentSet && !currentSet.completed && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900 space-y-6">
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-1">Target</p>
            {currentSet.targetWeight ? (
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {currentSet.targetWeight}kg
              </p>
            ) : null}
            <p className={`${currentSet.targetWeight ? "text-2xl" : "text-4xl"} font-semibold text-zinc-900 dark:text-zinc-100`}>
              × {currentSet.targetReps} reps
            </p>
            {currentExercise.rpeTarget && (
              <p className="text-sm text-zinc-500 mt-1">
                Target RPE: {currentExercise.rpeTarget} · Rest: {Math.floor(currentExercise.restSeconds / 60)}:{(currentExercise.restSeconds % 60).toString().padStart(2, "0")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Weight (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={currentSet.actualWeight || ""}
                onChange={(e) => updateSetData("actualWeight", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-2xl font-bold text-center outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Reps</label>
              <input
                type="number"
                inputMode="numeric"
                value={currentSet.actualReps || ""}
                onChange={(e) => updateSetData("actualReps", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-2xl font-bold text-center outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 block mb-2">Actual RPE</label>
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

          <input
            type="text"
            placeholder="Notes (optional)"
            value={currentSet.notes}
            onChange={(e) => updateSetData("notes", e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />

          {currentExercise.coachingNotes && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Coaching Tip</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{currentExercise.coachingNotes}</p>
            </div>
          )}

          <button
            onClick={saveSet}
            disabled={!currentSet.actualReps || !currentSet.actualWeight || isPending}
            className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : isLastSetOfCurrent ? "Complete Final Set" : "Complete Set"}
          </button>
        </div>
      )}

      {/* Finish Workout Button */}
      {allSetsCompleted && !showRestTimer && (
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
        <div className="space-y-1">
          {activeExercises.map((ex, exI) => {
            const completedCount = ex.sets.filter((s) => s.completed).length;
            const allDone = completedCount === ex.sets.length;
            return (
              <button
                key={exI}
                onClick={() => jumpToExercise(exI)}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  exI === currentExerciseIndex ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
              >
                <span className={`${exI === currentExerciseIndex ? "font-semibold" : ""} ${allDone ? "text-green-600 dark:text-green-400" : ""}`}>
                  {allDone ? "\u2713 " : ""}{ex.name}
                </span>
                <span className="text-zinc-500">
                  {completedCount}/{ex.sets.length} sets
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={openExercisePicker}
          className="mt-3 w-full rounded-lg border-2 border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500"
        >
          + Add Exercise
        </button>
      </div>

      {showExercisePicker && (
        <ExercisePicker
          exercises={libraryExercises}
          onSelect={addExerciseFromPicker}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
}
