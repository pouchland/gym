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
  { id: "availability", title: "Your Schedule", description: "How many days can you train?" },
  { id: "goals", title: "Your Goals", description: "What do you want to achieve?" },
  { id: "experience", title: "Experience", description: "Tell us about your training history" },
  { id: "plan", title: "Your Plan", description: "We recommend a plan based on your profile" },
];

// Evidence-based workout plans from pt_complete_guide.md
const workoutPlans = [
  {
    id: "fullbody",
    name: "Full Body (3 Days)",
    shortName: "Full Body",
    days: 3,
    description: "The best starting point for beginners. Squat, hinge, push, pull, and carry — hit three times per week. Fast technique improvement and sufficient volume for beginners.",
    frequency: "3 days/week",
    duration: "45-60 minutes",
    difficulty: "beginner",
    bestFor: ["Beginners", "Returners after break", "Busy schedules", "Technique focus"],
    structure: "Monday/Wednesday/Friday or any 3 non-consecutive days",
    keyMovements: ["Barbell back squat", "Romanian deadlift", "Dumbbell bench press", "Barbell row", "Overhead press"],
    science: "Research shows hitting muscles twice per week outperforms once. 3-day full body delivers 9-12 working sets per muscle — sufficient for meaningful progress.",
  },
  {
    id: "ul",
    name: "Upper/Lower Split (4 Days)",
    shortName: "Upper/Lower",
    days: 4,
    description: "Two upper body and two lower body sessions per week. Most efficient structure for intermediate clients — produces ~85% of gains of 5-day programs with less time investment.",
    frequency: "4 days/week",
    duration: "45-60 minutes",
    difficulty: "intermediate",
    bestFor: ["Intermediate trainees", "Strength + muscle balance", "Time-efficient volume"],
    structure: "Monday Upper, Tuesday Lower, Thursday Upper, Friday Lower",
    keyMovements: ["Bench press", "Barbell row", "Squat", "Romanian deadlift", "Overhead press"],
    science: "Upper/lower split allows more sets per muscle before fatigue sets in vs full body. Highly flexible — can differentiate horizontal vs vertical focus days.",
  },
  {
    id: "ppl",
    name: "Push/Pull/Legs (6 Days)",
    shortName: "PPL",
    days: 6,
    description: "Push (chest/shoulders/triceps), Pull (back/biceps), Legs — run twice per week. Popular with intermediate and advanced lifters. High per-session volume.",
    frequency: "6 days/week",
    duration: "60-75 minutes",
    difficulty: "intermediate",
    bestFor: ["Hypertrophy focus", "High frequency", "Consistent gym-goers", "Advanced lifters"],
    structure: "Push → Pull → Legs → Push → Pull → Legs",
    keyMovements: ["Bench variations", "Row variations", "Squat variations", "Lateral raises", "Arm work"],
    science: "PPL only works when all 6 sessions happen. Missing 2 sessions = muscles hit once instead of twice. Not for unpredictable schedules.",
  },
  {
    id: "pplul",
    name: "PPL + Upper/Lower (5 Days)",
    shortName: "PPLUL",
    days: 5,
    description: "The 5-day sweet spot. Push → Pull → Legs → Upper → Lower. Three upper sessions, two lower sessions. Highest-rated 5-day format for hypertrophy.",
    frequency: "5 days/week",
    duration: "60-75 minutes",
    difficulty: "intermediate",
    bestFor: ["More volume than 4-day", "Can't commit to 6 days", "Hypertrophy priority"],
    structure: "Monday Push, Tuesday Pull, Wednesday Legs, Thursday Upper, Friday Lower",
    keyMovements: ["Compound lifts", "Accessory work", "Volume accumulation"],
    science: "Predictive hypertrophy modeling scores PPLUL at 9.0/10 — highest of any 5-day format. Perfect middle ground.",
  },
  {
    id: "bro",
    name: "Bro Split (5-6 Days)",
    shortName: "Bro Split",
    days: 5,
    description: "Classic bodybuilding: Chest, Back, Legs, Shoulders, Arms. High per-session intensity. Produced extraordinary physiques for decades.",
    frequency: "5-6 days/week",
    duration: "60-90 minutes",
    difficulty: "intermediate",
    bestFor: ["Bodybuilding focus", "High intensity per session", "Recovery capacity"],
    structure: "Chest → Back → Legs → Shoulders → Arms (+ optional day)",
    keyMovements: ["High volume per muscle", "Isolation work", "Intense focus"],
    science: "Research shows 2x/week frequency outperforms 1x/week when volume is equated. But bro split intensity partially compensates. Still works, just not optimal first choice.",
  },
  {
    id: "gvt",
    name: "German Volume Training",
    shortName: "GVT",
    days: 3,
    description: "10 sets of 10 reps at 60% 1RM. Extreme volume protocol for breaking hypertrophy plateaus. Not for beginners — use as 6-8 week block.",
    frequency: "3 days/week",
    duration: "60-75 minutes",
    difficulty: "advanced",
    bestFor: ["Plateau breakthrough", "Hypertrophy focus", "Advanced trainees", "Short-term blocks"],
    structure: "Antagonist pairings with 60-90s rest: Squat/Leg curl, Bench/Row",
    keyMovements: ["Compound lifts", "High volume", "Moderate weight"],
    science: "100 reps per muscle in one session produces dramatic results. Metabolic demand is substantial. Deload required after block.",
  },
  {
    id: "hyrox",
    name: "Hyrox Training",
    shortName: "Hyrox",
    days: 5,
    description: "Functional fitness for Hyrox competitions. 8km running + 8 functional stations. Fastest-growing fitness competition globally.",
    frequency: "5-6 days/week",
    duration: "60-90 minutes",
    difficulty: "advanced",
    bestFor: ["Hyrox competition prep", "Endurance + strength", "Running focus", "Functional fitness"],
    structure: "Running + SkiErg, Sled Push/Pull, Burpees, Rowing, Farmers Carry, Lunges, Wall Balls",
    keyMovements: ["Running economy", "Compromised workouts", "Station efficiency"],
    science: "Hyrox is fundamentally a running race (51 min avg) vs stations (33 min). VO₂max and running volume correlate strongest with finish times.",
  },
  {
    id: "531",
    name: "5/3/1 Strength",
    shortName: "5/3/1",
    days: 4,
    description: "Jim Wendler's proven strength program. Simple progression based on percentages of training max. The gold standard for pure strength.",
    frequency: "4 days/week",
    duration: "45-60 minutes",
    difficulty: "intermediate",
    bestFor: ["Maximum strength", "Powerlifting", "Long-term progression", "Simple structure"],
    structure: "Squat, Bench, Deadlift, Press — each once per week with percentage-based waves",
    keyMovements: ["Squat", "Bench press", "Deadlift", "Overhead press"],
    science: "Neural adaptations drive strength. Training at 80-95% 1RM with lower reps (1-6) and longer rests (3-5 min) optimizes this.",
  },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [availableDays, setAvailableDays] = useState(4);
  const [goals, setGoals] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  const { stats, updateStats } = useUserStats();

  // Filter plans based on available days
  const suitablePlans = workoutPlans.filter(plan => plan.days <= availableDays);

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
          availableDays,
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
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to analyze goals:", error);
      // Use local recommendation logic
      const localRec = generateLocalRecommendation();
      setRecommendation(localRec);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalRecommendation = () => {
    const goalsLower = goals.toLowerCase();
    const experienceLevel = stats?.training_experience || "beginner";
    
    // Priority: Days available → Goals → Experience
    
    // 3 days available
    if (availableDays <= 3) {
      if (goalsLower.includes("strength") && experienceLevel === "advanced") {
        return { plan: "gvt", reason: "3 days is perfect for GVT's high-volume, focused approach." };
      }
      return { 
        plan: "fullbody", 
        reason: "Full body training is the gold standard for 3-day schedules. Every muscle trained 3x/week for optimal motor learning and growth."
      };
    }
    
    // 4 days available
    if (availableDays === 4) {
      if (goalsLower.includes("strength") || goalsLower.includes("power")) {
        return { 
          plan: "531", 
          reason: "4 days is perfect for 5/3/1's proven strength progression."
        };
      }
      return { 
        plan: "ul", 
        reason: "Upper/Lower split produces ~85% of 5-day gains with meaningful less time investment. Most efficient structure."
      };
    }
    
    // 5 days available
    if (availableDays === 5) {
      if (goalsLower.includes("hyrox") || goalsLower.includes("run")) {
        return { 
          plan: "hyrox", 
          reason: "5 days allows proper split of running, strength, and compromised workouts for Hyrox prep."
        };
      }
      return { 
        plan: "pplul", 
        reason: "PPLUL is the highest-rated 5-day format. Perfect middle ground between volume and recovery."
      };
    }
    
    // 6+ days available
    if (availableDays >= 6) {
      if (goalsLower.includes("bodybuild") || goalsLower.includes("size") || goalsLower.includes("mass")) {
        return { 
          plan: "ppl", 
          reason: "6-day PPL delivers maximum frequency and volume for hypertrophy. The bodybuilding standard."
        };
      }
      return { 
        plan: "bro", 
        reason: "High-frequency bro split allows maximum focus per muscle group with full recovery."
      };
    }
    
    // Default
    return { 
      plan: "ul", 
      reason: "Upper/Lower offers the best balance for most trainees."
    };
  };

  const selectPlan = async (planId: string) => {
    const selectedPlan = workoutPlans.find(p => p.id === planId);
    
    await updateStats({
      current_program: planId,
      current_week: 1,
      current_workout_number: 1,
      goals: goals,
      has_completed_onboarding: true,
      current_program_details: {
        name: selectedPlan?.name,
        days: selectedPlan?.days,
        frequency: selectedPlan?.frequency,
        structure: selectedPlan?.structure,
      },
    });
    
    router.push("/");
    router.refresh();
  };

  const step = steps[currentStep];

  // Step 1: Available Days
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
          <p className="text-zinc-500 mb-6">{step.description}</p>

          <div className="space-y-3">
            {[3, 4, 5, 6].map((days) => (
              <button
                key={days}
                onClick={() => setAvailableDays(days)}
                className={`w-full rounded-xl p-4 text-left border-2 transition-all ${
                  availableDays === days
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-zinc-100 hover:border-zinc-300 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{days} days per week</p>
                    <p className="text-sm text-zinc-500">
                      {days === 3 && "Best for beginners & busy schedules"}
                      {days === 4 && "Most popular & efficient"}
                      {days === 5 && "Maximum results, balanced recovery"}
                      {days === 6 && "For dedicated athletes"}
                    </p>
                  </div>
                  {availableDays === days && (
                    <span className="text-blue-600 text-xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Goals
  if (currentStep === 1) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Your Goals</h1>
          <p className="text-zinc-500 mt-2">What do you want to achieve?</p>
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
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="I want to build muscle, get stronger, run a 5K, compete in Hyrox..."
                className="w-full h-32 rounded-lg border border-zinc-200 p-3 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <p className="text-xs text-zinc-400 mt-2">
                Be specific! Mention events (marathon, Hyrox), physique goals, or strength targets.
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
                onClick={() => setCurrentStep(2)}
                disabled={!goals.trim()}
                className="flex-1 rounded-lg bg-blue-600 py-3 text-white font-medium disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Experience
  if (currentStep === 2) {
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
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="I&apos;ve been training for 2 years, mostly doing bro splits. I can bench 80kg, squat 100kg. I had a shoulder injury last year..."
                className="w-full h-32 rounded-lg border border-zinc-200 p-3 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <p className="text-xs text-zinc-400 mt-2">
                Include: years training, previous programs, current lifts, injuries/limitations.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
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

  // Step 4: Recommendation
  const recommendedPlan = workoutPlans.find(p => p.id === recommendation?.plan);
  
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Your Recommended Plan</h1>
        <p className="text-zinc-500 mt-2">Based on {availableDays} days/week and your goals</p>
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

      {recommendedPlan && (
        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-950">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              {recommendedPlan.name}
            </h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              Recommended
            </span>
          </div>
          
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            {recommendation?.reason || recommendedPlan.description}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Frequency</p>
              <p className="font-semibold">{recommendedPlan.frequency}</p>
            </div>
            <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Duration</p>
              <p className="font-semibold">{recommendedPlan.duration}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 dark:bg-zinc-900 mb-4">
            <p className="text-xs text-zinc-500 mb-1">The Science</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{recommendedPlan.science}</p>
          </div>

          <button
            onClick={() => selectPlan(recommendedPlan.id)}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium"
          >
            Start {recommendedPlan.shortName}
          </button>
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <h3 className="text-lg font-semibold mb-4">Other Options ({availableDays} days or less)</h3>
        
        <div className="space-y-3">
          {suitablePlans
            .filter(p => p.id !== recommendation?.plan)
            .map((plan) => (
              <button
                key={plan.id}
                onClick={() => selectPlan(plan.id)}
                className="w-full rounded-lg border border-zinc-200 p-4 text-left hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-sm text-zinc-500">{plan.description.substring(0, 60)}...</p>
                  </div>
                  <span className="text-sm text-zinc-400">{plan.days}d</span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
