import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .single();

  if (!workout) notFound();

  // Get user stats to know current week/workout for resume link
  const { data: userStats } = await supabase
    .from("user_stats")
    .select("current_week, current_workout_number")
    .eq("id", workout.user_id)
    .single();

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("*, exercise_library(name, muscle_group)")
    .eq("workout_id", id)
    .order("created_at");

  const isInProgress = !workout.completed_at;
  const currentWeek = userStats?.current_week || 1;
  const currentWorkout = userStats?.current_workout_number || 1;

  interface ExerciseGroup {
    name: string;
    muscle_group: string | null;
    sets: Array<{ id: string; weight: number | null; reps: number | null }>;
  }

  // Group sets by exercise
  const exerciseGroups: Record<string, ExerciseGroup> = {};
  for (const set of sets ?? []) {
    const exerciseName = (set.exercise_library as { name: string })?.name ?? set.notes?.split(" — ")[0] ?? "Unknown";
    if (!exerciseGroups[exerciseName]) {
      exerciseGroups[exerciseName] = {
        name: exerciseName,
        muscle_group: (set.exercise_library as { muscle_group: string | null })?.muscle_group,
        sets: [],
      };
    }
    exerciseGroups[exerciseName].sets.push(set);
  }

  const totalSets = sets?.length ?? 0;
  const totalVolume =
    sets?.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Home
        </Link>
        <h1 className="text-2xl font-bold">{workout.name || "Workout"}</h1>
        <p className="text-sm text-zinc-500">
          {formatDate(workout.started_at)} at {formatTime(workout.started_at)}
        </p>
      </div>

      {/* Resume banner for in-progress workouts */}
      {isInProgress && (
        <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-950">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
              In Progress
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            This workout hasn&apos;t been completed yet. Pick up where you left off.
          </p>
          <Link
            href={`/workout/program?week=${currentWeek}&workout=${currentWorkout}&resume=${id}`}
            className="block w-full rounded-lg bg-yellow-600 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-yellow-700"
          >
            Resume Workout
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Sets Logged</p>
          <p className="text-2xl font-bold">{totalSets}</p>
        </div>
        <div className="rounded-xl bg-white p-4 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Volume</p>
          <p className="text-2xl font-bold">
            {totalVolume.toLocaleString()}kg
          </p>
        </div>
      </div>

      {totalSets === 0 && (
        <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-900">
          <p className="text-zinc-500">No sets logged yet.</p>
        </div>
      )}

      {Object.values(exerciseGroups).map((group) => (
        <div
          key={group.name}
          className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900"
        >
          <div className="mb-3">
            <h3 className="font-semibold">{group.name}</h3>
            {group.muscle_group && (
              <p className="text-xs text-zinc-500">{group.muscle_group}</p>
            )}
          </div>

          <div className="space-y-1">
            {group.sets.map((set, i) => (
              <div
                key={set.id}
                className="flex items-center gap-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50"
              >
                <span className="w-8 text-center font-medium text-zinc-400">
                  {i + 1}
                </span>
                <span className="font-medium">{set.weight ?? 0}kg</span>
                <span className="text-zinc-400">×</span>
                <span className="font-medium">{set.reps ?? 0} reps</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
