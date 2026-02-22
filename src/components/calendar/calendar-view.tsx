"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Workout {
  id: string;
  name: string;
  started_at: string;
  completed_at: string | null;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchWorkouts();
  }, [currentDate]);

  const fetchWorkouts = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data } = await supabase
      .from("workouts")
      .select("id, name, started_at, completed_at")
      .gte("started_at", startOfMonth.toISOString())
      .lte("started_at", endOfMonth.toISOString())
      .order("started_at", { ascending: false });

    setWorkouts(data || []);
    setLoading(false);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const getWorkoutsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split("T")[0];
    return workouts.filter(w => w.started_at.startsWith(dateStr));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  if (loading) return <div className="p-4">Loading calendar...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h1>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayWorkouts = getWorkoutsForDay(day);
          const hasWorkout = dayWorkouts.length > 0;
          const completed = dayWorkouts.some(w => w.completed_at);

          return (
            <Link
              key={day}
              href={`/calendar/day?date=${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
              className={`aspect-square rounded-lg p-1 transition-colors ${
                isToday(day)
                  ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500"
                  : "bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <div className="flex flex-col h-full">
                <span className={`text-sm font-medium ${
                  isToday(day) ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"
                }`}>
                  {day}
                </span>
                {hasWorkout && (
                  <div className="flex-1 flex items-end">
                    <div className={`w-full h-1.5 rounded-full ${
                      completed ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-zinc-600 dark:text-zinc-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-zinc-600 dark:text-zinc-400">In Progress</span>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-3">This Month</h2>
        
        {workouts.length > 0 ? (
          <div className="space-y-2">
            {workouts.slice(0, 5).map((workout) => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                <div>
                  <p className="font-medium">{workout.name || "Workout"}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(workout.started_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {workout.completed_at ? (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Completed
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    In Progress
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No workouts this month yet.</p>
        )}
      </div>
    </div>
  );
}
