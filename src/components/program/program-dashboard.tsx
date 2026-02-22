"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { weeklySchedule, programMetadata, calcWeight } from "@/lib/bench-press-research";
import { useUserStats } from "@/lib/hooks/use-user-stats";

export function ProgramDashboard() {
  const { stats, updateStats, loading: statsLoading } = useUserStats();
  const [oneRepMax, setOneRepMax] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  // Load 1RM from stats
  useEffect(() => {
    if (stats?.bench_press_1rm) {
      setOneRepMax(stats.bench_press_1rm);
    } else if (stats?.bench_press_8rm) {
      // Estimate 1RM from 8RM
      setOneRepMax(Math.round(stats.bench_press_8rm * 1.25));
    }
  }, [stats]);

  const currentWeek = stats?.current_week || 1;
  const currentWorkout = stats?.current_workout_number || 1;

  const handleSaveSettings = useCallback(async () => {
    setIsSaving(true);
    await updateStats({ bench_press_1rm: oneRepMax });
    setIsSaving(false);
  }, [oneRepMax, updateStats]);

  const currentWeekData = weeklySchedule.find(w => w.week === currentWeek);
  
  // Map workout 1/2/3 to the actual days
  const workoutNumberMap: Record<number, string> = { 1: "Monday", 2: "Wednesday", 3: "Friday" };
  const nextWorkoutDay = workoutNumberMap[currentWorkout];
  const nextWorkout = currentWeekData?.days.find(d => d.dayOfWeek === nextWorkoutDay);

  // Get all 3 workouts for the week
  const weekWorkouts = [1, 2, 3].map(num => {
    const dayName = workoutNumberMap[num];
    const dayData = currentWeekData?.days.find(d => d.dayOfWeek === dayName);
    return { num, dayName, dayData, isNext: num === currentWorkout };
  });

  if (statsLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div>
        <h1 className="text-2xl font-bold">{programMetadata.name}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Week {currentWeek} of {programMetadata.totalWeeks} · {currentWeekData?.phase}
        </p>
      </div>

      {/* Settings Card */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-4">Program Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Bench Press 1RM (kg)
            </label>
            <input
              type="number"
              value={oneRepMax}
              onChange={(e) => setOneRepMax(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Used to calculate all working weights
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Current Week
            </label>
            <select
              value={currentWeek}
              onChange={(e) => updateStats({ current_week: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            >
              {Array.from({ length: programMetadata.totalWeeks }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Next Workout Card */}
      {nextWorkout && (
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Next Up: Workout {currentWorkout}
              </h2>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {nextWorkout.sessionType} session · RPE {nextWorkout.rpeTarget}
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              ~{nextWorkout.estimatedDurationMinutes} min
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {nextWorkout.exercises.slice(0, 3).map((ex, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">{ex.name}</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                  {ex.sets}×{ex.reps} 
                  {typeof ex.intensityPercent1RM === 'number' 
                    ? `@ ${calcWeight(ex.intensityPercent1RM, oneRepMax)}kg`
                    : '@ RPE target'
                  }
                </span>
              </div>
            ))}
            {nextWorkout.exercises.length > 3 && (
              <p className="text-xs text-zinc-500">
                +{nextWorkout.exercises.length - 3} more exercises
              </p>
            )}
          </div>

          <Link
            href={`/workout/program?week=${currentWeek}&workout=${currentWorkout}`}
            className="block w-full rounded-lg bg-blue-600 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Start Workout {currentWorkout}
          </Link>
        </div>
      )}

      {/* This Week's Workouts */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-3">This Week</h2>
        
        <div className="space-y-2">
          {weekWorkouts.map(({ num, dayData, isNext }) => (
            <Link
              key={num}
              href={`/workout/program?week=${currentWeek}&workout=${num}`}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                isNext
                  ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950"
                  : "border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
              }`}
            >
              <div>
                <p className="font-medium">
                  Workout {num}
                  {isNext && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Next
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 capitalize">
                  {dayData?.sessionType} · {dayData?.exercises.length} exercises
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-600">
                  RPE {dayData?.rpeTarget}
                </p>
                <p className="text-xs text-zinc-400">
                  {dayData?.estimatedDurationMinutes} min
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/program"
          className="flex items-center justify-center rounded-lg border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
        >
          Full Program
        </Link>
        <Link
          href="/calendar"
          className="flex items-center justify-center rounded-lg border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
        >
          Calendar
        </Link>
      </div>
    </div>
  );
}
