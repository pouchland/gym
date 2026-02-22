"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { weeklySchedule, calcWeight, type TrainingDay, type Exercise } from "@/lib/bench-press-research";
import { useUserStats } from "@/lib/hooks/use-user-stats";

interface WorkoutSet {
  id: string;
  exerciseIndex: number;
  setNumber: number;
  targetReps: number | string;
  targetWeight: number | null;
  actualReps: number | null;
  actualWeight: number | null;
  rpe: number | null;
  completed: boolean;
  notes: string;
}

interface ActiveExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

export function GuidedWorkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const week = Number(searchParams.get("week")) || 1;
  const workoutNum = Number(searchParams.get("workout")) || 1;
  const { stats, updateStats } = useUserStats();
  const supabase = createClient();

  // Use transition to avoid blocking UI
  const [isPending, startTransition] = useTransition();

  const [oneRepMax, setOneRepMax] = useState(100);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);

  // Map workout 1/2/3 to days
  const workoutDayMap: Record<number, string> = { 1: "Monday", 2: "Wednesday", 3: "Friday" };
  const dayName = workoutDayMap[workoutNum];

  const weekData = weeklySchedule.find(w => w.week === week);
  const dayData = weekData?.days.find(d => d.dayOfWeek === dayName);

  useEffect(() => {
    // Get 1RM from stats
    if (stats?.bench_press_1rm) {
      setOneRepMax(stats.bench_press_1rm);
    } else if (stats?.bench_press_8rm) {
      setOneRepMax(Math.round(stats.bench_press_8rm * 1.25));
    }
  }, [stats]);

  useEffect(() => {
    if (!dayData) return;
    
    const exercises: ActiveExercise[] = dayData.exercises.map((ex, exIndex) => {
      const numSets = ex.sets;
      const targetWeight = typeof ex.intensityPercent1RM === 'number' 
        ? calcWeight(ex.intensityPercent1RM, oneRepMax)
        : null;

      return {
        exercise: ex,
        sets: Array.from({ length: numSets }, (_, setIndex) => ({
          id: crypto.randomUUID(),
          exerciseIndex: exIndex,
          setNumber: setIndex + 1,
          targetReps: ex.reps,
          targetWeight,
          actualReps: null,
          actualWeight: targetWeight,
          rpe: null,
          completed: false,
          notes: "",
        })),
      };
    });
    
    setActiveExercises(exercises);
  }, [dayData, oneRepMax]);

  // Rest timer countdown
  useEffect(() => {
    if (!showRestTimer || restSeconds <= 0) return;
    
    const timer = setInterval(() => {
      setRestSeconds(s => {
        if (s <= 1) {
          setShowRestTimer(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showRestTimer, restSeconds]);

  // NON-BLOCKING start workout
  const startWorkout = useCallback(() => {
    if (!dayData) return;
    
    // Use startTransition to mark this as non-blocking
    startTransition(async () => {
      const { data, error } = await supabase
        .from("workouts")
        .insert({
          name: `Week ${week} Workout ${workoutNum} - ${dayData.sessionType}`,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("Failed to start workout:", error);
        return;
      }

      setWorkoutId(data.id);
      setWorkoutStarted(true);
    });
  }, [supabase, week, workoutNum, dayData]);

  // NON-BLOCKING save set
  const saveSet = useCallback(() => {
    const currentExercise = activeExercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets[currentSetIndex];
    
    if (!currentSet || !workoutId) return;

    startTransition(async () => {
      // Save to database
      await supabase.from("workout_sets").insert({
        workout_id: workoutId,
        exercise_id: null,
        set_number: currentSet.setNumber,
        reps: currentSet.actualReps,
        weight: currentSet.actualWeight,
        notes: `${currentExercise.exercise.name} - RPE ${currentSet.rpe || 'N/A'}`,
      });

      // Update local state
      setActiveExercises(prev =>
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
      const restTime = currentExercise.exercise.restSeconds;
      setRestSeconds(restTime);
      setShowRestTimer(true);

      // Move to next set or exercise
      if (currentSetIndex < currentExercise.sets.length - 1) {
        setCurrentSetIndex(prev => prev + 1);
      } else if (currentExerciseIndex < activeExercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
      }
    });
  }, [activeExercises, currentExerciseIndex, currentSetIndex, workoutId, supabase]);

  const updateSetData = (field: keyof WorkoutSet, value: number | string) => {
    setActiveExercises(prev =>
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

  // NON-BLOCKING finish workout
  const finishWorkout = useCallback(() => {
    if (!workoutId) return;
    setSaving(true);

    startTransition(async () => {
      await supabase
        .from("workouts")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", workoutId);

      // Increment workout number, or week if workout 3 completed
      let nextWorkout = workoutNum + 1;
      let nextWeek = week;
      
      if (nextWorkout > 3) {
        nextWorkout = 1;
        nextWeek = Math.min(week + 1, 12);
      }

      await updateStats({
        current_week: nextWeek,
        current_workout_number: nextWorkout,
      });

      setSaving(false);
      router.push("/");
    });
  }, [workoutId, supabase, router, week, workoutNum, updateStats]);

  if (!dayData) {
    return (
      <div className="p-4">
        <p className="text-red-500">Invalid workout selected.</p>
      </div>
    );
  }

  // Pre-workout screen
  if (!workoutStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Week {week} · Workout {workoutNum}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {weekData?.phase} · {dayData.sessionType} session
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Target RPE
            </span>
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {dayData.rpeTarget}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Est. Duration
            </span>
            <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {dayData.estimatedDurationMinutes} min
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Exercises</h2>
          {dayData.exercises.map((ex, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ex.name}</span>
                <span className="text-sm text-zinc-500">
                  {ex.sets} sets × {ex.reps} reps
                </span>
              </div>
              {typeof ex.intensityPercent1RM === 'number' && (
                <p className="text-sm text-zinc-400 mt-1">
                  Target: {calcWeight(ex.intensityPercent1RM, oneRepMax)}kg ({ex.intensityPercent1RM}% of {oneRepMax}kg 1RM)
                </p>
              )}
              {ex.notes && (
                <p className="text-xs text-zinc-500 mt-1 italic">{ex.notes}</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{currentExercise?.exercise.name}</h1>
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
            width: `${((currentExerciseIndex * 3 + currentSetIndex) / (activeExercises.length * 3)) * 100}%`,
          }}
        />
      </div>

      {/* Rest Timer Overlay */}
      {showRestTimer && restSeconds > 0 && (
        <div className="rounded-xl bg-orange-50 p-6 text-center dark:bg-orange-950">
          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Rest Time</p>
          <p className="text-5xl font-bold text-orange-900 dark:text-orange-100 my-2">
            {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Next: {isLastSet ? "Finish workout" : `${currentSetIndex < (currentExercise?.sets.length || 0) - 1 ? 'Next set' : 'Next exercise'}`}
          </p>
        </div>
      )}

      {/* Active Set Card */}
      {!showRestTimer && currentSet && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900 space-y-6">
          {/* Recommendation */}
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-1">Recommended</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {currentSet.targetWeight ? `${currentSet.targetWeight}kg` : 'RPE-based'}
            </p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              × {currentSet.targetReps} reps
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Target RPE: {dayData.rpeTarget} · Rest: {Math.floor(currentExercise.exercise.restSeconds / 60)}:{(currentExercise.exercise.restSeconds % 60).toString().padStart(2, '0')}
            </p>
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
                value={currentSet.actualWeight || ''}
                onChange={(e) => updateSetData('actualWeight', Number(e.target.value))}
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
                value={currentSet.actualReps || ''}
                onChange={(e) => updateSetData('actualReps', Number(e.target.value))}
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
                  onClick={() => updateSetData('rpe', rpe)}
                  className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                    currentSet.rpe === rpe
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
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
              onChange={(e) => updateSetData('notes', e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={saveSet}
            disabled={!currentSet.actualReps || !currentSet.actualWeight || isPending}
            className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : isLastSet ? "Complete Final Set" : "Complete Set"}
          </button>
        </div>
      )}

      {/* Finish Workout Button */}
      {isLastSet && !showRestTimer && (
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
            <div key={exI} className="flex items-center justify-between text-sm">
              <span className={exI === currentExerciseIndex ? 'font-semibold' : ''}>
                {ex.exercise.name}
              </span>
              <span className="text-zinc-500">
                {ex.sets.filter(s => s.completed).length}/{ex.sets.length} sets
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
