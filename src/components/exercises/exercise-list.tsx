"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/database";

const muscleGroups = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

interface ExerciseListProps {
  exercises: Exercise[];
}

export function ExerciseList({ exercises: initialExercises }: ExerciseListProps) {
  const [exercises, setExercises] = useState(initialExercises);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("Chest");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup =
      selectedGroup === "All" || ex.muscle_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Group by muscle_group
  const grouped = filtered.reduce(
    (acc, ex) => {
      const group = ex.muscle_group || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(ex);
      return acc;
    },
    {} as Record<string, Exercise[]>
  );

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        name: newName.trim(),
        muscle_group: newGroup,
        is_custom: true,
      })
      .select()
      .single();

    if (!error && data) {
      setExercises((prev) => [...prev, data]);
      setNewName("");
      setShowAddForm(false);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showAddForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={addExercise}
          className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900"
        >
          <input
            type="text"
            placeholder="Exercise name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            autoFocus
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {muscleGroups.filter((g) => g !== "All").map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving || !newName.trim()}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Exercise"}
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-base outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {muscleGroups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              selectedGroup === group
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {group}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          No exercises found
        </p>
      ) : (
        Object.entries(grouped).map(([group, exercises]) => (
          <div key={group}>
            <h2 className="mb-2 text-sm font-semibold uppercase text-zinc-400">
              {group}
            </h2>
            <div className="space-y-1">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3 dark:bg-zinc-900"
                >
                  <span className="font-medium">{ex.name}</span>
                  {ex.is_custom && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      Custom
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
