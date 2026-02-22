"use client";

import type { Supplement } from "@/lib/nutrition-engine";

interface SupplementListProps {
  supplements: Supplement[];
}

export function SupplementChecklist({ supplements }: SupplementListProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h3 className="font-semibold mb-3">Recommended Supplements</h3>

      <div className="space-y-2">
        {supplements.map((s) => (
          <div
            key={s.name}
            className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium">{s.name}</p>
              {s.priority === "essential" && (
                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Essential
                </span>
              )}
              {s.priority === "recommended" && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">{s.dose} — {s.timing}</p>
            <p className="text-xs text-zinc-400 mt-1">{s.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
