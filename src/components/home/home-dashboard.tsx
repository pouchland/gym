"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserStats } from "@/lib/hooks/use-user-stats";
import { useProgramTemplate } from "@/lib/hooks/use-program-templates";

interface DashboardData {
  totalWorkouts: number;
  currentStreak: number;
  lastWorkout: {
    name: string;
    date: string;
    completed: boolean;
  } | null;
  weeklyProgress: {
    completed: number;
    target: number;
  };
  prsThisMonth: number;
}

export function HomeDashboard() {
  const { stats } = useUserStats();
  const { template } = useProgramTemplate(stats?.current_program || null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: workouts } = await supabase
      .from("workouts")
      .select("name, started_at, completed_at")
      .order("started_at", { ascending: false })
      .limit(50);

    if (!workouts) {
      setLoading(false);
      return;
    }

    // Calculate stats
    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter(w => w.completed_at);
    
    // Streak calculation
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      
      const hadWorkout = completedWorkouts.some(w => 
        w.completed_at?.startsWith(dateStr)
      );
      
      if (hadWorkout) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Weekly progress
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekWorkouts = completedWorkouts.filter(w => 
      new Date(w.completed_at!) >= weekStart
    ).length;

    // Last workout
    const lastWorkout = workouts[0] ? {
      name: workouts[0].name,
      date: workouts[0].started_at,
      completed: !!workouts[0].completed_at,
    } : null;

    setData({
      totalWorkouts,
      currentStreak: streak,
      lastWorkout,
      weeklyProgress: {
        completed: thisWeekWorkouts,
        target: stats?.current_program_details?.days || 4,
      },
      prsThisMonth: 0, // Will implement PR tracking
    });
    
    setLoading(false);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const currentWeek = stats?.current_week || 1;
  const currentWorkout = stats?.current_workout_number || 1;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Good {getTimeOfDay()}! 👋</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {template?.name || "Ready to train?"}
          </p>
        </div>
        {data?.currentStreak > 0 && (
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-500">🔥 {data.currentStreak}</p>
            <p className="text-xs text-zinc-500">day streak</p>
          </div>
        )}
      </div>

      {/* Today's Workout Card */}
      <Link
        href="/workout"
        className="block rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Today&apos;s Workout</p>
            <h2 className="text-2xl font-bold mt-1">
              {template?.name ? `${template.name} — Workout ${currentWorkout}` : "Start Workout"}
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Week {currentWeek} · Tap to start
            </p>
          </div>
          <div className="rounded-full bg-white/20 p-3">
            <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Weekly Progress */}
      {data && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">This Week</h2>
            <span className="text-sm text-zinc-500">
              {data.weeklyProgress.completed}/{data.weeklyProgress.target} workouts
            </span>
          </div>
          
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{
                width: `${Math.min(100, (data.weeklyProgress.completed / data.weeklyProgress.target) * 100)}%`,
              }}
            />
          </div>
          
          <p className="text-xs text-zinc-500 mt-2">
            {data.weeklyProgress.completed >= data.weeklyProgress.target
              ? "🎉 Weekly goal completed!"
              : `${data.weeklyProgress.target - data.weeklyProgress.completed} more to hit your goal`}
          </p>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <p className="text-3xl font-bold">{data?.totalWorkouts || 0}</p>
          <p className="text-sm text-zinc-500">Total Workouts</p>
        </div>
        
        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <p className="text-3xl font-bold">{data?.prsThisMonth || 0}</p>
          <p className="text-sm text-zinc-500">PRs This Month</p>
        </div>
      </div>

      {/* Last Workout */}
      {data?.lastWorkout && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Last Workout</p>
              <p className="font-medium">{data.lastWorkout.name}</p>
              <p className="text-xs text-zinc-400">
                {new Date(data.lastWorkout.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                data.lastWorkout.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {data.lastWorkout.completed ? "Completed" : "In Progress"}
            </span>
          </div>        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/workout"
          className="flex flex-col items-center rounded-xl bg-zinc-100 p-4 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <span className="text-2xl mb-1">💪</span>
          <span className="text-xs font-medium">Workout</span>
        </Link>
        
        <Link
          href="/calendar"
          className="flex flex-col items-center rounded-xl bg-zinc-100 p-4 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <span className="text-2xl mb-1">📅</span>
          <span className="text-xs font-medium">Calendar</span>
        </Link>
        
        <Link
          href="/account"
          className="flex flex-col items-center rounded-xl bg-zinc-100 p-4 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <span className="text-2xl mb-1">⚙️</span>
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
