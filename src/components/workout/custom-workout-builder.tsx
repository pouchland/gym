"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStats } from "@/lib/hooks/use-user-stats";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  primary_muscles: string[];
  equipment: string;
  difficulty: string;
  why_good: string;
  pro_tips: string[];
  is_compound: boolean;
}

interface SelectedExercise {
  exercise: Exercise;
  sets: number;
  targetReps: string;
  targetWeight: number | null;
  restSeconds: number;
}

export function CustomWorkoutBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const muscleGroups = searchParams.get("groups")?.split(",") || [];
  const { stats } = useUserStats();
  const supabase = createClient();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [workoutName, setWorkoutName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [muscleGroups]);

  const fetchExercises = async () => {
    setLoading(true);
    
    const muscleGroupMap: Record<string, string[]> = {
      chest: ["Chest"],
      back: ["Back"],
      legs: ["Legs"],
      shoulders: ["Shoulders"],
      biceps: ["Arms"],
      triceps: ["Arms"],
      core: ["Core"],
      cardio: ["Cardio"],
      fullbody: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
    };

    const groupsToFetch = muscleGroups.flatMap(g => muscleGroupMap[g] || []);
    
    if (groupsToFetch.length === 0) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("exercise_library")
      .select("*")
      .in("muscle_group", groupsToFetch);

    // Sort by recommendation priority
    const sorted = sortByRecommendation(data || [], stats);
    setExercises(sorted);
    setLoading(false);
  };

  const sortByRecommendation = (exercises: Exercise[], userStats: any): Exercise[] => {
    return exercises.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prefer compound for beginners
      if (userStats?.training_experience === "beginner") {
        if (a.is_compound) scoreA += 10;
        if (b.is_compound) scoreB += 10;
      }

      // Match difficulty to experience
      const difficultyMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
      const userLevel = difficultyMap[userStats?.training_experience || "beginner"] || 1;
      const diffA = difficultyMap[a.difficulty] || 1;
      const diffB = difficultyMap[b.difficulty] || 1;

      if (Math.abs(diffA - userLevel) < Math.abs(diffB - userLevel)) scoreA += 5;
      if (Math.abs(diffB - userLevel) < Math.abs(diffA - userLevel)) scoreB += 5;

      return scoreB - scoreA;
    });
  };

  const addExercise = (exercise: Exercise) => {
    // Estimate weight based on exercise type
    let targetWeight: number | null = null;
    
    if (exercise.muscle_group === "Chest" && exercise.name.toLowerCase().includes("bench")) {
      targetWeight = stats?.bench_press_8rm ? Math.round(stats.bench_press_8rm * 0.9) : null;
    } else if (exercise.muscle_group === "Legs" && exercise.name.toLowerCase().includes("squat")) {
      targetWeight = stats?.squat_8rm ? Math.round(stats.squat_8rm * 0.9) : null;
    } else if (exercise.muscle_group === "Back" && exercise.name.toLowerCase().includes("deadlift")) {
      targetWeight = stats?.deadlift_8rm ? Math.round(stats.deadlift_8rm * 0.9) : null;
    }

    setSelectedExercises(prev => [...prev, {
      exercise,
      sets: 3,
      targetReps: "8-12",
      targetWeight,
      restSeconds: 90,
    }]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof SelectedExercise, value: any) => {
    setSelectedExercises(prev =>
      prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex)
    );
  };

  const startWorkout = useCallback(async () => {
    if (selectedExercises.length === 0) return;
    setSaving(true);

    const { data: workout, error } = await supabase
      .from("workouts")
      .insert({
        name: workoutName || `Custom ${muscleGroups.join("/")} Workout`,
      })
      .select("id")
      .single();

    if (error || !workout) {
      console.error("Failed to create workout:", error);
      setSaving(false);
      return;
    }

    // Store workout structure in localStorage for the active workout
    localStorage.setItem(`workout_${workout.id}_exercises`, JSON.stringify(selectedExercises));

    router.push(`/workout/active?id=${workout.id}`);
  }, [selectedExercises, workoutName, muscleGroups, supabase, router]);

  if (loading) return <div className="p-4">Loading exercises...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Build Workout</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {muscleGroups.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(", ")}
        </p>
      </div>

      {/* Workout Name */}
      <input
        type="text"
        placeholder="Workout name (optional)"
        value={workoutName}
        onChange={(e) => setWorkoutName(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
      />

      {/* Selected Exercises */}
      {selectedExercises.length > 0 && (
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
          <h2 className="text-lg font-semibold mb-3">Your Workout ({selectedExercises.length})</h2>
          
          <div className="space-y-3">
            {selectedExercises.map((item, index) => (
              <div key={index} className="rounded-lg bg-white p-3 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.exercise.name}</span>
                  <button
                    onClick={() => removeExercise(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-zinc-500">Sets</label>
                    <input
                      type="number"
                      value={item.sets}
                      onChange={(e) => updateExercise(index, "sets", Number(e.target.value))}
                      className="w-full rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Reps</label>
                    <input
                      type="text"
                      value={item.targetReps}
                      onChange={(e) => updateExercise(index, "targetReps", e.target.value)}
                      className="w-full rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Weight (kg)</label>
                    <input
                      type="number"
                      value={item.targetWeight || ""}
                      onChange={(e) => updateExercise(index, "targetWeight", e.target.value ? Number(e.target.value) : null)}
                      className="w-full rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                      placeholder="Auto"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={startWorkout}
            disabled={saving}
            className="mt-4 w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Starting..." : "Start Workout"}
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recommended Exercises</h2>
        
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    {exercise.is_compound && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        Compound
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">
                    {exercise.muscle_group} · {exercise.equipment} · {exercise.difficulty}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                    {exercise.why_good}
                  </p>
                  
                  {exercise.pro_tips?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {exercise.pro_tips.slice(0, 2).map((tip, i) => (
                        <span key={i} className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          💡 {tip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => addExercise(exercise)}
                  disabled={selectedExercises.some(e => e.exercise.id === exercise.id)}
                  className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:bg-zinc-400"
                >
                  {selectedExercises.some(e => e.exercise.id === exercise.id) ? "Added" : "Add"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
