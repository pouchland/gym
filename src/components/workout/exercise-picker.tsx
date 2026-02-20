"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/database";

interface ExercisePickerProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const muscleGroups = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

export function ExercisePicker({
  exercises,
  onSelect,
  onClose,
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGroup =
      selectedGroup === "All" || ex.muscle_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-zinc-900 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Add Exercise</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            autoFocus
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
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No exercises found
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => {
                    onSelect(exercise);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                >
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    {exercise.muscle_group && (
                      <p className="text-sm text-zinc-500">
                        {exercise.muscle_group}
                      </p>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 text-zinc-400">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
