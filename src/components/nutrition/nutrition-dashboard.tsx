"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUserStats } from "@/lib/hooks/use-user-stats";
import {
  generateNutritionPlan,
  type Gender,
  type NutritionPlan,
} from "@/lib/nutrition-engine";
import { SupplementChecklist } from "./supplement-checklist";
import { TipsSection } from "./tips-section";

export function NutritionDashboard() {
  const { stats, loading } = useUserStats();

  const plan: NutritionPlan | null = useMemo(() => {
    if (!stats?.gender || !stats?.bodyweight_kg || !stats?.height_cm || !stats?.age) {
      return null;
    }
    return generateNutritionPlan({
      gender: stats.gender as Gender,
      bodyweight_kg: stats.bodyweight_kg,
      height_cm: stats.height_cm,
      age: stats.age,
      activity_level: stats.activity_level || "moderate",
      current_program: stats.current_program || "ul",
      goals: stats.goals,
    });
  }, [stats]);

  if (loading) return <div className="p-4">Loading...</div>;

  // Missing data CTA
  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Nutrition</h1>
        <div className="rounded-xl bg-white p-6 shadow-sm text-center dark:bg-zinc-900">
          <p className="text-4xl mb-3">🥗</p>
          <h2 className="text-lg font-semibold mb-2">Complete Your Profile</h2>
          <p className="text-sm text-zinc-500 mb-4">
            We need your age, height, and weight to calculate personalized nutrition targets.
          </p>
          <Link
            href="/account"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium"
          >
            Update Profile
          </Link>
        </div>
      </div>
    );
  }

  const hydrationLiters = (plan.hydration_ml / 1000).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Nutrition</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {plan.goal_label} — {plan.calorie_adjustment_percent > 0 ? "+" : ""}
          {plan.calorie_adjustment_percent !== 0
            ? `${plan.calorie_adjustment_percent}% ${plan.calorie_adjustment_percent > 0 ? "surplus" : "deficit"}`
            : "maintenance"}
        </p>
      </div>

      {/* Calorie / Macro Card */}
      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-zinc-900">
        <div className="text-center mb-4">
          <p className="text-sm text-zinc-500">Daily Target</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {plan.targets.calories.toLocaleString()}
            <span className="text-lg font-medium text-zinc-400 ml-1">kcal</span>
          </p>
        </div>

        <div className="space-y-3">
          {/* Protein */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Protein</span>
              <span className="text-zinc-500">
                {plan.targets.protein_g}g ({plan.protein_per_kg}g/kg)
              </span>
            </div>
            <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${Math.min(100, ((plan.targets.protein_g * 4) / plan.targets.calories) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Carbs</span>
              <span className="text-zinc-500">{plan.targets.carbs_g}g</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${Math.min(100, ((plan.targets.carbs_g * 4) / plan.targets.calories) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Fat</span>
              <span className="text-zinc-500">{plan.targets.fat_g}g</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
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

      {/* Hydration */}
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <span className="text-2xl">💧</span>
        <div>
          <p className="font-semibold">{hydrationLiters}L water per day</p>
          <p className="text-xs text-zinc-500">
            Add 0.5-1L per hour of exercise
          </p>
        </div>
      </div>

      {/* Supplement Checklist */}
      <SupplementChecklist supplements={plan.supplements} />

      {/* Meal Timing */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h3 className="font-semibold mb-3">Meal Timing</h3>
        <div className="space-y-3">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-xs font-medium text-zinc-500 mb-1">Pre-Workout</p>
            <p className="text-sm">{plan.meal_timing.pre_workout}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-xs font-medium text-zinc-500 mb-1">Post-Workout</p>
            <p className="text-sm">{plan.meal_timing.post_workout}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-xs font-medium text-zinc-500 mb-1">Protein Distribution</p>
            <p className="text-sm">{plan.meal_timing.protein_distribution}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-xs font-medium text-zinc-500 mb-1">Before Sleep</p>
            <p className="text-sm">{plan.meal_timing.before_sleep}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-sm text-blue-800 dark:text-blue-200">{plan.summary}</p>
      </div>

      {/* Tips */}
      <TipsSection tips={plan.tips} />

      {/* Update stats link */}
      <Link
        href="/account"
        className="block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Update your stats to recalculate targets
      </Link>
    </div>
  );
}
