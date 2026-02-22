"use client";

import { GuidedWorkout } from "@/components/program/guided-workout";
import { Suspense } from "react";

export default function ProgramWorkoutPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading workout...</div>}>
      <GuidedWorkout />
    </Suspense>
  );
}
