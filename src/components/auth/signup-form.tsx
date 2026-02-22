"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function SignupForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Account info
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Stats
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  
  // 1RMs
  const [bench1RM, setBench1RM] = useState("");
  const [bench8RM, setBench8RM] = useState("");
  const [squat1RM, setSquat1RM] = useState("");
  const [squat8RM, setSquat8RM] = useState("");
  const [deadlift1RM, setDeadlift1RM] = useState("");
  const [deadlift8RM, setDeadlift8RM] = useState("");
  const [ohp1RM, setOhp1RM] = useState("");
  const [ohp8RM, setOhp8RM] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Signup failed");
      setLoading(false);
      return;
    }

    // Update user stats (row already created by trigger, just update it)
    const { error: statsError } = await supabase
      .from("user_stats")
      .update({
        gender,
        age: age ? Number(age) : null,
        height_cm: height ? Number(height) : null,
        bodyweight_kg: bodyweight ? Number(bodyweight) : null,
        training_experience: experience,
        bench_press_1rm: bench1RM ? Number(bench1RM) : null,
        bench_press_8rm: bench8RM ? Number(bench8RM) : null,
        squat_1rm: squat1RM ? Number(squat1RM) : null,
        squat_8rm: squat8RM ? Number(squat8RM) : null,
        deadlift_1rm: deadlift1RM ? Number(deadlift1RM) : null,
        deadlift_8rm: deadlift8RM ? Number(deadlift8RM) : null,
        overhead_press_1rm: ohp1RM ? Number(ohp1RM) : null,
        overhead_press_8rm: ohp8RM ? Number(ohp8RM) : null,
      })
      .eq("id", authData.user.id);

    if (statsError) {
      console.error("Failed to save stats:", statsError);
      // Don't fail signup if stats save fails
    }

    router.push("/");
    router.refresh();
  }

  const nextStep = () => {
    if (step === 1 && (!displayName || !email || !password)) {
      setError("Please fill in all fields");
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Step 1 of 3: Account info
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>

        <button
          onClick={nextStep}
          className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
        >
          Continue
        </button>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Step 2 of 3: Personal details
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Gender</label>
            <div className="mt-2 flex gap-2">
              {["male", "female", "other"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g as "male" | "female" | "other")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                    gender === g
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Age</label>
              <input
                type="number"
                placeholder="e.g., 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Height (cm)</label>
              <input
                type="number"
                placeholder="e.g., 178"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bodyweight (kg)</label>
            <input
              type="number"
              placeholder="e.g., 75"
              value={bodyweight}
              onChange={(e) => setBodyweight(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Training Experience</label>
            <div className="mt-2 flex gap-2">
              {["beginner", "intermediate", "advanced"].map((exp) => (
                <button
                  key={exp}
                  onClick={() => setExperience(exp as "beginner" | "intermediate" | "advanced")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                    experience === exp
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 rounded-lg border border-zinc-200 py-3 text-base font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="flex-1 rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Your Strength</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Step 3 of 3: Enter your current lifts (optional)
        </p>
        <p className="text-xs text-zinc-400">
          We use this to calculate your starting weights. Leave blank if unsure.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Bench */}
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="font-medium mb-2">Bench Press</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="1RM (kg)"
              value={bench1RM}
              onChange={(e) => setBench1RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              type="number"
              placeholder="8RM (kg)"
              value={bench8RM}
              onChange={(e) => setBench8RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Squat */}
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="font-medium mb-2">Squat</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="1RM (kg)"
              value={squat1RM}
              onChange={(e) => setSquat1RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              type="number"
              placeholder="8RM (kg)"
              value={squat8RM}
              onChange={(e) => setSquat8RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Deadlift */}
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="font-medium mb-2">Deadlift</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="1RM (kg)"
              value={deadlift1RM}
              onChange={(e) => setDeadlift1RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              type="number"
              placeholder="8RM (kg)"
              value={deadlift8RM}
              onChange={(e) => setDeadlift8RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* OHP */}
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="font-medium mb-2">Overhead Press</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="1RM (kg)"
              value={ohp1RM}
              onChange={(e) => setOhp1RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              type="number"
              placeholder="8RM (kg)"
              value={ohp8RM}
              onChange={(e) => setOhp8RM(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 rounded-lg border border-zinc-200 py-3 text-base font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}
