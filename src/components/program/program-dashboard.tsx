"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { weeklySchedule, programMetadata, calcWeight } from "@/lib/bench-press-research";

interface ProgramSettings {
  oneRepMax: number;
  currentWeek: number;
}

export function ProgramDashboard() {
  const [settings, setSettings] = useState<ProgramSettings>({
    oneRepMax: 100,
    currentWeek: 1,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Load saved settings
    const storedMax = localStorage.getItem("gym_bench_1rm");
    const storedWeek = localStorage.getItem("gym_bench_current_week");
    
    setSettings({
      oneRepMax: storedMax ? Number(storedMax) : 100,
      currentWeek: storedWeek ? Number(storedWeek) : 1,
    });
    setLoading(false);
  }, []);

  const saveSettings = () => {
    localStorage.setItem("gym_bench_1rm", String(settings.oneRepMax));
    localStorage.setItem("gym_bench_current_week", String(settings.currentWeek));
    // Show toast or feedback
    alert("Settings saved!");
  };

  const currentWeekData = weeklySchedule.find(w => w.week === settings.currentWeek);
  const today = new Date().getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[today] as "Monday" | "Wednesday" | "Friday";
  
  const todayWorkout = currentWeekData?.days.find(d => d.dayOfWeek === todayName);
  const upcomingWorkouts = currentWeekData?.days.filter(d => {
    const dayIndex = dayNames.indexOf(d.dayOfWeek);
    return dayIndex >= today;
  }) || [];

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div>
        <h1 className="text-2xl font-bold">{programMetadata.name}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Week {settings.currentWeek} of {programMetadata.totalWeeks} · {currentWeekData?.phase}
        </p>
      </div>

      {/* Settings Card */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-4">Program Settings</h2>
        
        <div className="space-y-4">
          {/* 1RM Input */}
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Bench Press 1RM (kg)
            </label>
            <input
              type="number"
              value={settings.oneRepMax}
              onChange={(e) => setSettings(s => ({ ...s, oneRepMax: Number(e.target.value) }))}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Used to calculate all working weights
            </p>
          </div>

          {/* Starting Week */}
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Current Week
            </label>
            <select
              value={settings.currentWeek}
              onChange={(e) => setSettings(s => ({ ...s, currentWeek: Number(e.target.value) }))}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            >
              {Array.from({ length: programMetadata.totalWeeks }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Already completed some weeks? Jump ahead here.
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Today's Workout */}
      {todayWorkout && (
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Today&apos;s Workout
              </h2>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {todayName} · {todayWorkout.sessionType} session · RPE {todayWorkout.rpeTarget}
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              ~{todayWorkout.estimatedDurationMinutes} min
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {todayWorkout.exercises.slice(0, 3).map((ex, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">{ex.name}</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                  {ex.sets}×{ex.reps} 
                  {typeof ex.intensityPercent1RM === 'number' 
                    ? `@ ${calcWeight(ex.intensityPercent1RM, settings.oneRepMax)}kg`
                    : '@ RPE target'
                  }
                </span>
              </div>
            ))}
            {todayWorkout.exercises.length > 3 && (
              <p className="text-xs text-zinc-500">
                +{todayWorkout.exercises.length - 3} more exercises
              </p>
            )}
          </div>

          <Link
            href={`/workout/program?week=${settings.currentWeek}&day=${todayName}`}
            className="block w-full rounded-lg bg-blue-600 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Start Today&apos;s Workout
          </Link>
        </div>
      )}

      {/* Upcoming This Week */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-3">This Week</h2>
        
        {upcomingWorkouts.length > 0 ? (
          <div className="space-y-2">
            {upcomingWorkouts.map((day) => (
              <Link
                key={day.dayOfWeek}
                href={`/workout/program?week=${settings.currentWeek}&day=${day.dayOfWeek}`}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                <div>
                  <p className="font-medium">{day.dayOfWeek}</p>
                  <p className="text-xs text-zinc-500 capitalize">
                    {day.sessionType} · RPE {day.rpeTarget}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-600">
                    {day.exercises[0]?.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {day.exercises.length} exercises · {day.estimatedDurationMinutes} min
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            No more workouts scheduled this week. Rest up or jump to next week!
          </p>
        )}
      </div>

      {/* Full Program View Link */}
      <Link
        href="/program"
        className="flex items-center justify-center rounded-lg border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        View Full Program Schedule
        <svg className="ml-1 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
