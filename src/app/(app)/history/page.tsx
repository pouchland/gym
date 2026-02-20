import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("*, workout_sets(id, reps, weight, exercise_id)")
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">History</h1>

      {!workouts || workouts.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center dark:bg-zinc-900">
          <p className="text-zinc-500">No workouts yet.</p>
          <Link
            href="/workout"
            className="mt-2 inline-block text-sm font-medium text-blue-600"
          >
            Start your first workout
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map((workout) => {
            const sets = workout.workout_sets ?? [];
            const totalSets = sets.length;
            const totalVolume = sets.reduce(
              (sum: number, s: { reps: number | null; weight: number | null }) =>
                sum + (s.weight ?? 0) * (s.reps ?? 0),
              0
            );
            const uniqueExercises = new Set(
              sets.map((s: { exercise_id: string }) => s.exercise_id)
            ).size;

            return (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="block rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {workout.name || "Workout"}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {formatDate(workout.started_at)}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 text-zinc-400">
                    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mt-2 flex gap-4 text-sm text-zinc-500">
                  <span>{uniqueExercises} exercises</span>
                  <span>{totalSets} sets</span>
                  <span>{totalVolume.toLocaleString()} lbs</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
