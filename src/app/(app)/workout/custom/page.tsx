"use client";

import { CustomWorkoutBuilder } from "@/components/workout/custom-workout-builder";
import { Suspense } from "react";

export default function CustomWorkoutPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <CustomWorkoutBuilder />
    </Suspense>
  );
}
