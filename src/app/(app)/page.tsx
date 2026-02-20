"use client";

import { createClient } from "@/lib/supabase/client";
import { useUsername } from "@/components/username-provider";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Workout {
  id: string;
  name: string | null;
  started_at: string;
  workout_sets: { id: string; reps: number | null; weight: number | null }[];
}

export default function DashboardPage() {
  const { username } = useUsername();
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: last } = await supabase
        .from("workouts")
        .select("*, workout_sets(id, reps, weight)")
        .not("completed_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (last) setLastWorkout(last);

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("workouts")
        .select("id", { count: "exact", head: true })
        .not("completed_at", "is", null)
        .gte("started_at", startOfWeek.toISOString());

      setWeeklyCount(count ?? 0);
    }
    load();
  }, [supabase]);

  const lastVolume = lastWorkout
    ? (lastWorkout.workout_sets ?? []).reduce(
        (sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0),
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Hey{username ? `, ${username}` : ""}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ready to train?
        </p>
      </div>

      <Link
        href="/workout"
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 active:bg-blue-800"
      >
        Start Workout
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">This Week</p>
          <p className="text-3xl font-bold">{weeklyCount}</p>
          <p className="text-xs text-zinc-400">workouts</p>
        </div>
        <Link
          href="/program"
          className="rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <p className="text-sm text-zinc-500">12-Week</p>
          <p className="text-3xl font-bold">Bench</p>
          <p className="text-xs text-zinc-400">program &rarr;</p>
        </Link>
      </div>

      {lastWorkout && (
        <Link
          href={`/workout/${lastWorkout.id}`}
          className="block rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <p className="text-sm text-zinc-500">Last Workout</p>
          <h3 className="font-semibold">
            {lastWorkout.name || "Workout"}
          </h3>
          <p className="text-sm text-zinc-500">
            {formatDate(lastWorkout.started_at)} &middot;{" "}
            {(lastWorkout.workout_sets ?? []).length} sets &middot;{" "}
            {lastVolume.toLocaleString()} lbs
          </p>
        </Link>
      )}
    </div>
  );
}
