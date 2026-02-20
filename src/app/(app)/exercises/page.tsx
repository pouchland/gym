import { createClient } from "@/lib/supabase/server";
import { ExerciseList } from "@/components/exercises/exercise-list";

export default async function ExercisesPage() {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .order("muscle_group")
    .order("name");

  return <ExerciseList exercises={exercises ?? []} />;
}
