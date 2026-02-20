"use client";

import { cn } from "@/lib/utils";

interface SetRowProps {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
  onUpdate: (data: { reps?: number | null; weight?: number | null }) => void;
  onToggleComplete: () => void;
  onRemove: () => void;
}

export function SetRow({
  setNumber,
  reps,
  weight,
  completed,
  onUpdate,
  onToggleComplete,
  onRemove,
}: SetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
        completed ? "bg-green-50 dark:bg-green-950/30" : "bg-zinc-50 dark:bg-zinc-800/50"
      )}
    >
      <span className="w-8 text-center text-sm font-medium text-zinc-400">
        {setNumber}
      </span>

      <div className="flex flex-1 items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            inputMode="decimal"
            placeholder="lbs"
            value={weight ?? ""}
            onChange={(e) =>
              onUpdate({
                weight: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-center text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            disabled={completed}
          />
        </div>

        <span className="text-zinc-400">×</span>

        <div className="flex-1">
          <input
            type="number"
            inputMode="numeric"
            placeholder="reps"
            value={reps ?? ""}
            onChange={(e) =>
              onUpdate({
                reps: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-center text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            disabled={completed}
          />
        </div>
      </div>

      <button
        onClick={onToggleComplete}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg transition-colors",
          completed
            ? "bg-green-500 text-white"
            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
      </button>

      {!completed && (
        <button
          onClick={onRemove}
          className="flex size-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 0 0 7.761 20h4.478a2.75 2.75 0 0 0 2.742-2.689l1.005-11.36.149.022a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .7.797l-.5 5.5a.75.75 0 0 1-1.494-.136l.5-5.5a.75.75 0 0 1 .794-.66Zm2.84 0a.75.75 0 0 1 .794.66l.5 5.5a.75.75 0 0 1-1.494.137l-.5-5.5a.75.75 0 0 1 .7-.798Z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
