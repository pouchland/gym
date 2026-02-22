"use client";

import { useState, useMemo } from "react";

interface TipsSectionProps {
  tips: string[];
}

export function TipsSection({ tips }: TipsSectionProps) {
  // Daily rotation: use day-of-year as seed
  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, []);

  const [tipIndex, setTipIndex] = useState(dayOfYear % tips.length);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

  if (tips.length === 0) return null;

  return (
    <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Tip of the Day
        </h3>
        <span className="text-xs text-amber-600 dark:text-amber-400">
          {tipIndex + 1}/{tips.length}
        </span>
      </div>
      <p className="text-sm text-amber-900 dark:text-amber-100 mb-3">
        {tips[tipIndex]}
      </p>
      <button
        onClick={nextTip}
        className="text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
      >
        Next tip →
      </button>
    </div>
  );
}
