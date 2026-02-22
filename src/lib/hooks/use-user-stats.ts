"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface UserStats {
  id: string;
  gender: "male" | "female" | "other" | null;
  bodyweight_kg: number | null;
  training_experience: "beginner" | "intermediate" | "advanced" | null;
  bench_press_1rm: number | null;
  bench_press_8rm: number | null;
  squat_1rm: number | null;
  squat_8rm: number | null;
  deadlift_1rm: number | null;
  deadlift_8rm: number | null;
  overhead_press_1rm: number | null;
  overhead_press_8rm: number | null;
  current_program: string;
  current_week: number;
  current_workout_number: number;
  created_at: string;
  updated_at: string;
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStats(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        // Stats might not exist yet
        if (fetchError.code === "PGRST116") {
          setStats(null);
        } else {
          setError(fetchError.message);
        }
      } else {
        setStats(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateStats = useCallback(async (updates: Partial<UserStats>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { error: "Not authenticated" };

      const { data, error: updateError } = await supabase
        .from("user_stats")
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        return { error: updateError.message };
      }

      setStats(data);
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    updateStats,
  };
}

// Helper to estimate 1RM from 8RM if 1RM not available
export function estimate1RM(rm8: number): number {
  // Epley formula: 1RM = weight × (1 + reps/30)
  return Math.round(rm8 * (1 + 8 / 30));
}

// Get effective 1RM for an exercise
export function getEffective1RM(stats: UserStats | null, exercise: "bench" | "squat" | "deadlift" | "ohp"): number {
  if (!stats) return 100; // Default
  
  switch (exercise) {
    case "bench":
      return stats.bench_press_1rm || (stats.bench_press_8rm ? estimate1RM(stats.bench_press_8rm) : 100);
    case "squat":
      return stats.squat_1rm || (stats.squat_8rm ? estimate1RM(stats.squat_8rm) : 100);
    case "deadlift":
      return stats.deadlift_1rm || (stats.deadlift_8rm ? estimate1RM(stats.deadlift_8rm) : 100);
    case "ohp":
      return stats.overhead_press_1rm || (stats.overhead_press_8rm ? estimate1RM(stats.overhead_press_8rm) : 60);
    default:
      return 100;
  }
}
