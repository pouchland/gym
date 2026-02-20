import { createClient } from "@/lib/supabase/server";
import { ActiveWorkout } from "@/components/workout/active-workout";

export default async function WorkoutPage() {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .order("muscle_group")
    .order("name");

  return <ActiveWorkout exercises={exercises ?? []} />;
}
