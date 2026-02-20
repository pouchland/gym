import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Get last workout
  const { data: lastWorkout } = await supabase
    .from("workouts")
    .select("*, workout_sets(id, reps, weight)")
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  // Get this week's workout count
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: weeklyCount } = await supabase
    .from("workouts")
    .select("id", { count: "exact", head: true })
    .not("completed_at", "is", null)
    .gte("started_at", startOfWeek.toISOString());

  const lastVolume = lastWorkout
    ? (lastWorkout.workout_sets ?? []).reduce(
        (sum: number, s: { reps: number | null; weight: number | null }) =>
          sum + (s.weight ?? 0) * (s.reps ?? 0),
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Hey{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ready to train?
        </p>
      </div>

      <Link
        href="/workout"
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 active:bg-blue-800"
      >
        Start Workout
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">This Week</p>
          <p className="text-3xl font-bold">{weeklyCount ?? 0}</p>
          <p className="text-xs text-zinc-400">workouts</p>
        </div>
        <Link
          href="/program"
          className="rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <p className="text-sm text-zinc-500">12-Week</p>
          <p className="text-3xl font-bold">Bench</p>
          <p className="text-xs text-zinc-400">program &rarr;</p>
        </Link>
      </div>

      {lastWorkout && (
        <Link
          href={`/workout/${lastWorkout.id}`}
          className="block rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <p className="text-sm text-zinc-500">Last Workout</p>
          <h3 className="font-semibold">
            {lastWorkout.name || "Workout"}
          </h3>
          <p className="text-sm text-zinc-500">
            {formatDate(lastWorkout.started_at)} &middot;{" "}
            {(lastWorkout.workout_sets ?? []).length} sets &middot;{" "}
            {lastVolume.toLocaleString()} lbs
          </p>
        </Link>
      )}
    </div>
  );
}
