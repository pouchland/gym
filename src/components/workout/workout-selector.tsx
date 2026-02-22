"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserStats } from "@/lib/hooks/use-user-stats";

const muscleGroups = [
  { id: "chest", name: "Chest", icon: "💪", color: "bg-red-100 text-red-700" },
  { id: "back", name: "Back", icon: "🎯", color: "bg-blue-100 text-blue-700" },
  { id: "legs", name: "Legs", icon: "🦵", color: "bg-green-100 text-green-700" },
  { id: "shoulders", name: "Shoulders", icon: "🎽", color: "bg-yellow-100 text-yellow-700" },
  { id: "biceps", name: "Biceps", icon: "💪", color: "bg-purple-100 text-purple-700" },
  { id: "triceps", name: "Triceps", icon: "🦾", color: "bg-orange-100 text-orange-700" },
  { id: "core", name: "Core", icon: "🔥", color: "bg-pink-100 text-pink-700" },
  { id: "cardio", name: "Cardio", icon: "❤️", color: "bg-cyan-100 text-cyan-700" },
  { id: "fullbody", name: "Full Body", icon: "⚡", color: "bg-indigo-100 text-indigo-700" },
];

export function WorkoutSelector() {
  const { stats, loading } = useUserStats();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const currentWeek = stats?.current_week || 1;
  const currentWorkout = stats?.current_workout_number || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Start Workout</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Choose your workout for today
        </p>
      </div>

      {/* Program Workout Card */}
      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Next Program Workout
          </h2>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Week {currentWeek} · Workout {currentWorkout}
          </span>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
          Continue your bench press specialization program
        </p>
        <Link
          href={`/workout/program?week=${currentWeek}&workout=${currentWorkout}`}
          className="block w-full rounded-lg bg-blue-600 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Start Program Workout
        </Link>
      </div>

      {/* OR Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-sm text-zinc-500">or</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Custom Workout */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Custom Workout</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Select muscle groups to train
        </p>

        <div className="grid grid-cols-2 gap-3">
          {muscleGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => toggleGroup(group.id)}
              className={`rounded-xl p-4 text-left transition-all ${
                selectedGroups.includes(group.id)
                  ? "ring-2 ring-blue-500 bg-white dark:bg-zinc-900"
                  : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{group.icon}</span>
                <div>
                  <p className="font-medium">{group.name}</p>
                  {selectedGroups.includes(group.id) && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${group.color}`}>
                      Selected
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedGroups.length > 0 && (
          <Link
            href={`/workout/custom?groups=${selectedGroups.join(",")}`}
            className="mt-4 block w-full rounded-lg bg-green-600 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-green-700"
          >
            Start Custom Workout ({selectedGroups.length} groups)
          </Link>
        )}
      </div>

      {/* Calendar Link */}
      <Link
        href="/calendar"
        className="flex items-center justify-center rounded-lg border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
      >
        <svg className="mr-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        View Calendar
      </Link>
    </div>
  );
}
