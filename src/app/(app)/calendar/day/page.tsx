"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Workout {
  id: string;
  name: string;
  started_at: string;
  completed_at: string | null;
}

function CalendarDayContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const date = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function fetchDayWorkouts() {
      if (!dateParam) {
        setLoading(false);
        return;
      }

      const dayStart = `${dateParam}T00:00:00`;
      const dayEnd = `${dateParam}T23:59:59`;

      const { data } = await supabase
        .from("workouts")
        .select("id, name, started_at, completed_at")
        .gte("started_at", dayStart)
        .lte("started_at", dayEnd)
        .order("started_at", { ascending: false });

      setWorkouts(data || []);
      setLoading(false);
    }

    fetchDayWorkouts();
  }, [dateParam]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/calendar"
          className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Calendar
        </Link>
        <h1 className="text-2xl font-bold">{dateStr}</h1>
      </div>

      {workouts.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-zinc-900">
          <p className="text-zinc-500 mb-4">No workouts on this day</p>
          <Link
            href="/workout"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium"
          >
            Start Workout
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/workout/${workout.id}`}
              className="block rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{workout.name || "Workout"}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Started at{" "}
                    {new Date(workout.started_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    workout.completed_at
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {workout.completed_at ? "Completed" : "In Progress"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CalendarDayPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <CalendarDayContent />
    </Suspense>
  );
}
