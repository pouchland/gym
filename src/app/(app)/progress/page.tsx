"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VolumeData {
  date: string;
  volume: number;
}

export default function ProgressPage() {
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch workouts with their sets for volume calculation
      const { data: workouts } = await supabase
        .from("workouts")
        .select("id, started_at, workout_sets(reps, weight)")
        .not("completed_at", "is", null)
        .order("started_at", { ascending: true })
        .limit(30);

      if (workouts) {
        const chartData = workouts.map((w) => {
          const volume = (w.workout_sets ?? []).reduce(
            (sum: number, s: { reps: number | null; weight: number | null }) =>
              sum + (s.weight ?? 0) * (s.reps ?? 0),
            0
          );
          return {
            date: new Date(w.started_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            volume,
          };
        });
        setVolumeData(chartData);
      }
      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Progress</h1>
        <div className="flex h-64 items-center justify-center rounded-xl bg-white dark:bg-zinc-900">
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Progress</h1>

      {volumeData.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center dark:bg-zinc-900">
          <p className="text-zinc-500">
            Complete some workouts to see your progress.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold">Volume Over Time</h2>
          <p className="mb-2 text-xs text-zinc-500">Total lbs lifted per workout</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#a1a1aa"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4, fill: "#2563eb" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
