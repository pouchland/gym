"use client";

import { useState, useMemo } from "react";
import type { UserStats } from "@/lib/hooks/use-user-stats";
import {
  generateNutritionPlan,
  ACTIVITY_LABELS,
  type ActivityLevel,
  type Gender,
  type NutritionPlan,
} from "@/lib/nutrition-engine";

interface NutritionPreviewProps {
  stats: UserStats | null;
  selectedPlan: string;
  goals: string;
  onConfirm: () => void;
  onBack: () => void;
  onUpdateStats: (updates: Partial<UserStats>) => Promise<unknown>;
}

export function NutritionPreview({
  stats,
  selectedPlan,
  goals,
  onConfirm,
  onBack,
  onUpdateStats,
}: NutritionPreviewProps) {
  const [age, setAge] = useState(stats?.age?.toString() || "");
  const [height, setHeight] = useState(stats?.height_cm?.toString() || "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    stats?.activity_level || "moderate",
  );
  const [saving, setSaving] = useState(false);

  const needsInput = !stats?.age || !stats?.height_cm;

  const plan: NutritionPlan | null = useMemo(() => {
    const ageVal = age ? Number(age) : stats?.age;
    const heightVal = height ? Number(height) : stats?.height_cm;

    if (!ageVal || !heightVal || !stats?.bodyweight_kg || !stats?.gender) return null;

    return generateNutritionPlan({
      gender: stats.gender as Gender,
      bodyweight_kg: stats.bodyweight_kg,
      height_cm: heightVal,
      age: ageVal,
      activity_level: activityLevel,
      current_program: selectedPlan,
      goals,
    });
  }, [age, height, activityLevel, stats, selectedPlan, goals]);

  const handleConfirm = async () => {
    setSaving(true);
    if (age || height) {
      await onUpdateStats({
        age: age ? Number(age) : undefined,
        height_cm: height ? Number(height) : undefined,
        activity_level: activityLevel,
      });
    }
    onConfirm();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Your Nutrition Plan</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Fueling your training for maximum results
        </p>
      </div>

      {/* Quick data collection if needed */}
      {needsInput && (
        <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="mb-3 text-sm font-medium text-blue-700 dark:text-blue-300">
            We need a few details to calculate your nutrition targets:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500">Age</label>
              <input
                type="number"
                placeholder="e.g., 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Height (cm)</label>
              <input
                type="number"
                placeholder="e.g., 178"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-zinc-500">Activity Level</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setActivityLevel(level)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activityLevel === level
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {ACTIVITY_LABELS[level]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Results */}
      {plan ? (
        <>
          {/* Calorie Target */}
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 mb-1">Daily Calorie Target</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {plan.targets.calories.toLocaleString()}
              <span className="text-lg font-medium text-zinc-400 ml-1">kcal</span>
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {plan.calorie_adjustment_percent > 0
                ? `+${plan.calorie_adjustment_percent}% surplus for ${plan.goal_label.toLowerCase()}`
                : plan.calorie_adjustment_percent < 0
                  ? `${plan.calorie_adjustment_percent}% deficit for ${plan.goal_label.toLowerCase()}`
                  : `Maintenance for ${plan.goal_label.toLowerCase()}`}
            </p>
          </div>

          {/* Macro Breakdown */}
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h3 className="font-semibold mb-3">Daily Macros</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{plan.targets.protein_g}g</p>
                <p className="text-xs text-zinc-500">Protein</p>
                <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(100, ((plan.targets.protein_g * 4) / plan.targets.calories) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{plan.targets.carbs_g}g</p>
                <p className="text-xs text-zinc-500">Carbs</p>
                <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${Math.min(100, ((plan.targets.carbs_g * 4) / plan.targets.calories) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-500">{plan.targets.fat_g}g</p>
                <p className="text-xs text-zinc-500">Fat</p>
                <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-rose-400"
                    style={{
                      width: `${Math.min(100, ((plan.targets.fat_g * 9) / plan.targets.calories) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Supplements */}
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h3 className="font-semibold mb-2">Key Supplements</h3>
            <div className="flex flex-wrap gap-2">
              {plan.supplements
                .filter((s) => s.priority === "essential" || s.priority === "recommended")
                .slice(0, 4)
                .map((s) => (
                  <span
                    key={s.name}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      s.priority === "essential"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {s.name} — {s.dose}
                  </span>
                ))}
            </div>
          </div>

          {/* Hydration */}
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <span className="text-2xl">💧</span>
            <div>
              <p className="font-semibold">{(plan.hydration_ml / 1000).toFixed(1)}L water/day</p>
              <p className="text-xs text-zinc-500">Based on your bodyweight</p>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">{plan.summary}</p>
          </div>
        </>
      ) : (
        <div className="rounded-xl bg-zinc-100 p-6 text-center dark:bg-zinc-800">
          <p className="text-zinc-500">
            Fill in your age and height above to see personalized nutrition targets.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-200 py-3 text-base font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving || !plan}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Starting..." : "Start Training"}
        </button>
      </div>
    </div>
  );
}
