"use client";

import { useState, useEffect } from "react";
import type { Supplement } from "@/lib/nutrition-engine";

interface SupplementChecklistProps {
  supplements: Supplement[];
}

function getTodayKey(): string {
  return `supplement-checks-${new Date().toISOString().split("T")[0]}`;
}

export function SupplementChecklist({ supplements }: SupplementChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getTodayKey());
      if (stored) setChecked(JSON.parse(stored));
    } catch {
      // localStorage unavailable (e.g., Safari private browsing)
    }
  }, []);

  const toggle = (name: string) => {
    const updated = { ...checked, [name]: !checked[name] };
    setChecked(updated);
    try {
      localStorage.setItem(getTodayKey(), JSON.stringify(updated));
    } catch {
      // localStorage unavailable
    }
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Supplements</h3>
        <span className="text-xs text-zinc-500">
          {checkedCount}/{supplements.length} taken
        </span>
      </div>

      <div className="space-y-2">
        {supplements.map((s) => (
          <button
            key={s.name}
            onClick={() => toggle(s.name)}
            className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
              checked[s.name]
                ? "bg-green-50 dark:bg-green-950"
                : "bg-zinc-50 dark:bg-zinc-800/50"
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                checked[s.name]
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
            >
              {checked[s.name] && (
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${checked[s.name] ? "line-through text-zinc-400" : ""}`}>
                  {s.name}
                </p>
                {s.priority === "essential" && (
                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    Essential
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{s.dose} — {s.timing}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
