"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStats } from "@/lib/hooks/use-user-stats";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { id: "goals", title: "Your Goals", description: "What do you want to achieve?" },
  { id: "experience", title: "Experience", description: "Tell us about your training history" },
  { id: "plan", title: "Your Plan", description: "We recommend a plan based on your goals" },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  const { stats, updateStats } = useUserStats();

  const analyzeGoals = async () => {
    setLoading(true);
    
    try {
      // Call Kimi API to analyze goals
      const response = await fetch("/api/analyze-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          experience,
          userStats: {
            gender: stats?.gender,
            bodyweight: stats?.bodyweight_kg,
            trainingExperience: stats?.training_experience,
            bench1RM: stats?.bench_press_1rm,
            squat1RM: stats?.squat_1rm,
            deadlift1RM: stats?.deadlift_1rm,
          },
        }),
      });

      const data = await response.json();
      setRecommendation(data.recommendation);
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to analyze goals:", error);
      // Fallback to default recommendation
      setRecommendation({
        plan: "ppl",
        reason: "Based on your goals, a Push/Pull/Legs split offers the best balance of frequency and volume for consistent progress.",
        frequency: "6 days per week",
        duration: "45-60 minutes",
        focus: "Hypertrophy and strength development",
      });
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = async (planId: string) => {
    await updateStats({
      current_program: planId,
      current_week: 1,
      current_workout_number: 1,
      goals: goals,
      has_completed_onboarding: true,
    });
    
    router.push("/");
    router.refresh();
  };

  const step = steps[currentStep];

  if (currentStep === 0) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to GYM</h1>
          <p className="text-zinc-500 mt-2">Let&apos;s create your personalized training plan</p>
        </div>

        <div className="flex justify-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`h-2 w-8 rounded-full ${
                i === currentStep ? "bg-blue-600" : i < currentStep ? "bg-blue-300" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
          <p className="text-zinc-500 mb-4">{step.description}</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">What are your fitness goals?</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="I want to build muscle, lose fat, get stronger for..."
                className="mt-2 w-full h-32 rounded-lg border border-zinc-200 p-3 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Be specific! Mention muscle groups, events (marathon, competition), or physique goals.
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              disabled={!goals.trim()}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Training History</h1>
          <p className="text-zinc-500 mt-2">Tell us about your experience</p>
        </div>

        <div className="flex justify-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`h-2 w-8 rounded-full ${
                i === currentStep ? "bg-blue-600" : i < currentStep ? "bg-blue-300" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
          <p className="text-zinc-500 mb-4">{step.description}</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">What&apos;s your training background?</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="I&apos;ve been training for 2 years, mostly doing bro splits. I can bench 80kg, squat 100kg..."
                className="mt-2 w-full h-32 rounded-lg border border-zinc-200 p-3 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Include: years training, previous programs, current lifts, injuries/limitations.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(0)}
                className="flex-1 rounded-lg border border-zinc-200 py-3 text-zinc-600"
              >
                Back
              </button>
              <button
                onClick={analyzeGoals}
                disabled={!experience.trim() || loading}
                className="flex-1 rounded-lg bg-blue-600 py-3 text-white font-medium disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Create My Plan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 - Recommendation
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Your Recommended Plan</h1>
        <p className="text-zinc-500 mt-2">Based on your goals and experience</p>
      </div>

      <div className="flex justify-center gap-2">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`h-2 w-8 rounded-full ${
              i === currentStep ? "bg-blue-600" : i < currentStep ? "bg-blue-300" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      {recommendation && (
        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-950">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {workoutPlans.find(p => p.id === recommendation.plan)?.name || "Custom Plan"}
          </h2>
          <p className="text-blue-700 dark:text-blue-300 mb-4">{recommendation.reason}</p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
              <p className="text-zinc-500">Frequency</p>
              <p className="font-semibold">{recommendation.frequency}</p>
            </div>
            <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
              <p className="text-zinc-500">Duration</p>
              <p className="font-semibold">{recommendation.duration}</p>
            </div>
          </div>

          <button
            onClick={() => selectPlan(recommendation.plan)}
            className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-white font-medium"
          >
            Start This Plan
          </button>        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <h3 className="text-lg font-semibold mb-4">Or Choose Another Plan</h3>
        
        <div className="space-y-3">
          {workoutPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => selectPlan(plan.id)}
              className="w-full rounded-lg border border-zinc-200 p-4 text-left hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-sm text-zinc-500">{plan.description}</p>
                </div>
                <span className="text-sm text-zinc-400">{plan.frequency}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const workoutPlans = [
  {
    id: "ppl",
    name: "Push/Pull/Legs (PPL)",
    description: "The classic 6-day hypertrophy split. Push (chest/shoulders/triceps), Pull (back/biceps), Legs.",
    frequency: "6 days/week",
    difficulty: "intermediate",
    bestFor: "Hypertrophy, high frequency",
  },
  {
    id: "ul",
    name: "Upper/Lower (UL)",
    description: "Alternate upper and lower body days. Great for strength and muscle building with moderate frequency.",
    frequency: "4 days/week",
    difficulty: "beginner",
    bestFor: "Strength, balanced development",
  },
  {
    id: "bro",
    name: "Bro Split",
    description: "One muscle group per day. Chest day, back day, leg day, etc. Classic bodybuilding style.",
    frequency: "5-6 days/week",
    difficulty: "beginner",
    bestFor: "Hypertrophy, recovery",
  },
  {
    id: "fullbody",
    name: "Full Body",
    description: "Train entire body each session. High frequency, lower volume per muscle per session.",
    frequency: "3 days/week",
    difficulty: "beginner",
    bestFor: "Beginners, strength, time-efficient",
  },
  {
    id: "hyrox",
    name: "Hyrox Training",
    description: "Functional fitness combining running with functional exercises. Prepare for Hyrox competitions.",
    frequency: "5-6 days/week",
    difficulty: "advanced",
    bestFor: "Endurance, functional fitness",
  },
  {
    id: "phat",
    name: "PHAT",
    description: "Power Hypertrophy Adaptive Training. Power days + hypertrophy days for size and strength.",
    frequency: "5 days/week",
    difficulty: "advanced",
    bestFor: "Size + strength combo",
  },
  {
    id: "531",
    name: "5/3/1",
    description: "Jim Wendler's strength program. Simple progression based on percentages of training max.",
    frequency: "4 days/week",
    difficulty: "intermediate",
    bestFor: "Strength, powerlifting",
  },
];
