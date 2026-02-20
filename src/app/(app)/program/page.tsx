"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  weeklySchedule,
  benchPressStudies,
  phaseSummaries,
  programMetadata,
  rpeGuidelines,
  evidenceSynthesis,
} from "@/lib/bench-press-research";
import type { PhaseName } from "@/lib/bench-press-research";

type Tab = "schedule" | "studies" | "guide";

const phaseColors: Record<PhaseName, string> = {
  "Anatomical Adaptation": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Hypertrophy Accumulation": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "Strength Intensification": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Peaking: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Deload: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

const sessionColors: Record<string, string> = {
  heavy: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
  moderate: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900",
  light: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
};

export default function ProgramPage() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{programMetadata.name}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {programMetadata.totalWeeks} weeks &middot; {programMetadata.sessionsPerWeek}x/week &middot; {programMetadata.periodizationModel}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {(["schedule", "studies", "guide"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors",
              activeTab === tab
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            {tab === "guide" ? "RPE Guide" : tab}
          </button>
        ))}
      </div>

      {activeTab === "schedule" && (
        <ScheduleTab expandedWeek={expandedWeek} setExpandedWeek={setExpandedWeek} />
      )}
      {activeTab === "studies" && <StudiesTab />}
      {activeTab === "guide" && <GuideTab />}
    </div>
  );
}

function ScheduleTab({
  expandedWeek,
  setExpandedWeek,
}: {
  expandedWeek: number | null;
  setExpandedWeek: (w: number | null) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Phase overview */}
      <div className="space-y-2">
        {phaseSummaries.map((phase) => (
          <div
            key={phase.weeks}
            className={cn("rounded-lg px-3 py-2 text-sm", phaseColors[phase.phase])}
          >
            <span className="font-semibold">
              Wk {phase.weeks}: {phase.phase}
            </span>
            <span className="mx-2">&middot;</span>
            <span>{phase.intensityRange}</span>
            <span className="mx-2">&middot;</span>
            <span>{phase.weeklyBenchSets} sets/wk</span>
          </div>
        ))}
      </div>

      {/* Weekly schedule */}
      <div className="space-y-2">
        {weeklySchedule.map((week) => (
          <div
            key={week.week}
            className="rounded-xl bg-white shadow-sm dark:bg-zinc-900"
          >
            <button
              onClick={() =>
                setExpandedWeek(expandedWeek === week.week ? null : week.week)
              }
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">Week {week.week}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    phaseColors[week.phase]
                  )}
                >
                  {week.phase}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn(
                  "size-5 text-zinc-400 transition-transform",
                  expandedWeek === week.week && "rotate-180"
                )}
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {expandedWeek === week.week && (
              <div className="space-y-3 px-4 pb-4">
                {week.notes && (
                  <p className="text-xs text-zinc-500 italic">{week.notes}</p>
                )}

                {week.days.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className={cn(
                      "rounded-lg border p-3",
                      sessionColors[day.sessionType]
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">{day.dayOfWeek}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium capitalize dark:bg-zinc-800/80">
                          {day.sessionType}
                        </span>
                        <span className="text-xs text-zinc-500">
                          RPE {day.rpeTarget}
                        </span>
                        <span className="text-xs text-zinc-400">
                          ~{day.estimatedDurationMinutes}min
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {day.exercises.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{ex.name}</p>
                            {ex.notes && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                          <div className="ml-2 text-right shrink-0">
                            <p className="font-mono text-xs">
                              {ex.sets}×{ex.reps} @{" "}
                              {ex.intensityPercent1RM === "N/A"
                                ? "RPE"
                                : `${ex.intensityPercent1RM}%`}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {Math.floor(ex.restSeconds / 60)}:{(ex.restSeconds % 60)
                                .toString()
                                .padStart(2, "0")}{" "}
                              rest
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudiesTab() {
  const [expandedStudy, setExpandedStudy] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-2">Evidence Summary</h2>
        <div className="space-y-3">
          {Object.entries(evidenceSynthesis).map(([key, val]) => (
            <div key={key}>
              <p className="text-sm font-medium capitalize">
                {key.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {val.recommendation}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{val.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold">10 Key Studies</h2>
      <div className="space-y-2">
        {benchPressStudies.map((study) => (
          <div
            key={study.id}
            className="rounded-xl bg-white shadow-sm dark:bg-zinc-900"
          >
            <button
              onClick={() =>
                setExpandedStudy(expandedStudy === study.id ? null : study.id)
              }
              className="w-full px-4 py-3 text-left"
            >
              <p className="text-sm font-medium">{study.title}</p>
              <p className="text-xs text-zinc-500">
                {study.authors[0]} et al. ({study.year}) &middot; {study.journal}
              </p>
            </button>

            {expandedStudy === study.id && (
              <div className="px-4 pb-4 space-y-2">
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase">
                    Topic
                  </p>
                  <p className="text-sm capitalize">
                    {study.topic.replace(/_/g, " ")}
                  </p>
                </div>

                {study.sampleSize > 0 && (
                  <p className="text-xs text-zinc-500">
                    n={study.sampleSize} &middot; {study.durationWeeks > 0 ? `${study.durationWeeks} weeks` : "Meta-analysis"} &middot;{" "}
                    {study.populationType}
                  </p>
                )}

                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase">
                    Key Findings
                  </p>
                  <ul className="space-y-1 mt-1">
                    {study.keyFindings.map((finding, i) => (
                      <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                        &bull; {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase">
                    Protocol
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {study.protocol.programDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GuideTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-3">RPE / RIR Scale</h2>
        <div className="space-y-1">
          {rpeGuidelines.scale.map((item) => (
            <div
              key={item.rpe}
              className="flex items-start gap-3 rounded-lg px-2 py-1.5"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  item.rpe >= 9
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                    : item.rpe >= 7
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                    : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                )}
              >
                {item.rpe}
              </span>
              <div>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs text-zinc-400">
                  {item.repsInReserve} reps in reserve
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-3">Session-Type Targets</h2>
        <div className="space-y-3">
          {Object.entries(rpeGuidelines.programUsage).map(([key, val]) => (
            <div key={key}>
              <p className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-xs text-zinc-500">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-3">Autoregulation Rules</h2>
        <ol className="space-y-2">
          {rpeGuidelines.autoregulationRules.map((rule, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500 dark:bg-zinc-800">
                {i + 1}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
