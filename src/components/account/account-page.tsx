"use client";

import { createClient } from "@/lib/supabase/client";
import { useUserStats, type NotificationPreferences } from "@/lib/hooks/use-user-stats";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

export function AccountPage() {
  const { stats, loading, updateStats } = useUserStats();
  const router = useRouter();
  const supabase = createClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    enabled: false,
    morning_check: "07:00",
    pre_workout: "16:00",
    hydration: true,
    supplement: true,
  });

  useEffect(() => {
    if (stats?.notification_preferences) {
      setNotifPrefs((prev) => ({ ...prev, ...stats.notification_preferences }));
    }
  }, [stats?.notification_preferences]);

  // Form state — initialized empty, synced via useEffect when stats load
  const [formData, setFormData] = useState({
    gender: "male" as string,
    age: "",
    height: "",
    bodyweight: "",
    activityLevel: "moderate" as string,
    experience: "beginner" as string,
    bench1RM: "",
    bench8RM: "",
    squat1RM: "",
    squat8RM: "",
    deadlift1RM: "",
    deadlift8RM: "",
    ohp1RM: "",
    ohp8RM: "",
    currentWeek: "1",
    currentWorkout: "1",
  });

  // Sync form state when stats load
  useEffect(() => {
    if (!stats) return;
    setFormData({
      gender: stats.gender || "male",
      age: stats.age?.toString() || "",
      height: stats.height_cm?.toString() || "",
      bodyweight: stats.bodyweight_kg?.toString() || "",
      activityLevel: stats.activity_level || "moderate",
      experience: stats.training_experience || "beginner",
      bench1RM: stats.bench_press_1rm?.toString() || "",
      bench8RM: stats.bench_press_8rm?.toString() || "",
      squat1RM: stats.squat_1rm?.toString() || "",
      squat8RM: stats.squat_8rm?.toString() || "",
      deadlift1RM: stats.deadlift_1rm?.toString() || "",
      deadlift8RM: stats.deadlift_8rm?.toString() || "",
      ohp1RM: stats.overhead_press_1rm?.toString() || "",
      ohp8RM: stats.overhead_press_8rm?.toString() || "",
      currentWeek: stats.current_week?.toString() || "1",
      currentWorkout: stats.current_workout_number?.toString() || "1",
    });
  }, [stats]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    const result = await updateStats({
      gender: formData.gender as "male" | "female" | "other",
      age: formData.age ? Number(formData.age) : null,
      height_cm: formData.height ? Number(formData.height) : null,
      bodyweight_kg: formData.bodyweight ? Number(formData.bodyweight) : null,
      activity_level: formData.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active",
      training_experience: formData.experience as "beginner" | "intermediate" | "advanced",
      bench_press_1rm: formData.bench1RM ? Number(formData.bench1RM) : null,
      bench_press_8rm: formData.bench8RM ? Number(formData.bench8RM) : null,
      squat_1rm: formData.squat1RM ? Number(formData.squat1RM) : null,
      squat_8rm: formData.squat8RM ? Number(formData.squat8RM) : null,
      deadlift_1rm: formData.deadlift1RM ? Number(formData.deadlift1RM) : null,
      deadlift_8rm: formData.deadlift8RM ? Number(formData.deadlift8RM) : null,
      overhead_press_1rm: formData.ohp1RM ? Number(formData.ohp1RM) : null,
      overhead_press_8rm: formData.ohp8RM ? Number(formData.ohp8RM) : null,
      current_week: Number(formData.currentWeek) || 1,
      current_workout_number: Number(formData.currentWorkout) || 1,
      notification_preferences: notifPrefs,
    });

    setIsSaving(false);

    if (!result.error) {
      setIsEditing(false);
    }
  }, [formData, notifPrefs, updateStats]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-zinc-500">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your profile and stats
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      {/* Profile Section */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Gender</label>
            {isEditing ? (
              <div className="mt-2 flex gap-2">
                {["male", "female", "other"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g as "male" | "female" | "other" })}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                      formData.gender === g
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-base capitalize">{stats?.gender || "Not set"}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Age</label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="years"
                />
              ) : (
                <p className="mt-1 text-base">{stats?.age ? `${stats.age} years` : "Not set"}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Height</label>
              {isEditing ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="cm"
                  />
                  <span className="text-zinc-500">cm</span>
                </div>
              ) : (
                <p className="mt-1 text-base">{stats?.height_cm ? `${stats.height_cm} cm` : "Not set"}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bodyweight</label>
            {isEditing ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  value={formData.bodyweight}
                  onChange={(e) => setFormData({ ...formData, bodyweight: e.target.value })}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="kg"
                />
                <span className="text-zinc-500">kg</span>
              </div>
            ) : (
              <p className="mt-1 text-base">{stats?.bodyweight_kg ? `${stats.bodyweight_kg} kg` : "Not set"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Activity Level</label>
            {isEditing ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {([
                  ["sedentary", "Sedentary"],
                  ["light", "Light"],
                  ["moderate", "Moderate"],
                  ["active", "Active"],
                  ["very_active", "Very Active"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFormData({ ...formData, activityLevel: value })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      formData.activityLevel === value
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-base capitalize">{stats?.activity_level?.replace("_", " ") || "Not set"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Experience</label>
            {isEditing ? (
              <div className="mt-2 flex gap-2">
                {["beginner", "intermediate", "advanced"].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => setFormData({ ...formData, experience: exp as "beginner" | "intermediate" | "advanced" })}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                      formData.experience === exp
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-base capitalize">{stats?.training_experience || "Not set"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Strength Stats */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-4">Strength Stats</h2>
        
        <div className="space-y-4">
          {/* Bench */}
          <div className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
            <p className="font-medium mb-2">Bench Press</p>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-500">1RM (kg)</label>
                  <input
                    type="number"
                    value={formData.bench1RM}
                    onChange={(e) => setFormData({ ...formData, bench1RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">8RM (kg)</label>
                  <input
                    type="number"
                    value={formData.bench8RM}
                    onChange={(e) => setFormData({ ...formData, bench8RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-4 text-sm">
                <span>1RM: {stats?.bench_press_1rm ? `${stats.bench_press_1rm}kg` : "Not set"}</span>
                <span>8RM: {stats?.bench_press_8rm ? `${stats.bench_press_8rm}kg` : "Not set"}</span>
              </div>
            )}
          </div>

          {/* Squat */}
          <div className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
            <p className="font-medium mb-2">Squat</p>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-500">1RM (kg)</label>
                  <input
                    type="number"
                    value={formData.squat1RM}
                    onChange={(e) => setFormData({ ...formData, squat1RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">8RM (kg)</label>
                  <input
                    type="number"
                    value={formData.squat8RM}
                    onChange={(e) => setFormData({ ...formData, squat8RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-4 text-sm">
                <span>1RM: {stats?.squat_1rm ? `${stats.squat_1rm}kg` : "Not set"}</span>
                <span>8RM: {stats?.squat_8rm ? `${stats.squat_8rm}kg` : "Not set"}</span>
              </div>
            )}
          </div>

          {/* Deadlift */}
          <div className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
            <p className="font-medium mb-2">Deadlift</p>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-500">1RM (kg)</label>
                  <input
                    type="number"
                    value={formData.deadlift1RM}
                    onChange={(e) => setFormData({ ...formData, deadlift1RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">8RM (kg)</label>
                  <input
                    type="number"
                    value={formData.deadlift8RM}
                    onChange={(e) => setFormData({ ...formData, deadlift8RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-4 text-sm">
                <span>1RM: {stats?.deadlift_1rm ? `${stats.deadlift_1rm}kg` : "Not set"}</span>
                <span>8RM: {stats?.deadlift_8rm ? `${stats.deadlift_8rm}kg` : "Not set"}</span>
              </div>
            )}
          </div>

          {/* OHP */}
          <div className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
            <p className="font-medium mb-2">Overhead Press</p>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-500">1RM (kg)</label>
                  <input
                    type="number"
                    value={formData.ohp1RM}
                    onChange={(e) => setFormData({ ...formData, ohp1RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">8RM (kg)</label>
                  <input
                    type="number"
                    value={formData.ohp8RM}
                    onChange={(e) => setFormData({ ...formData, ohp8RM: e.target.value })}
                    className="w-full rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-4 text-sm">
                <span>1RM: {stats?.overhead_press_1rm ? `${stats.overhead_press_1rm}kg` : "Not set"}</span>
                <span>8RM: {stats?.overhead_press_8rm ? `${stats.overhead_press_8rm}kg` : "Not set"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Progress */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-4">Program Progress</h2>
        
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current Week</label>
              <select
                value={formData.currentWeek}
                onChange={(e) => setFormData({ ...formData, currentWeek: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current Workout</label>
              <select
                value={formData.currentWorkout}
                onChange={(e) => setFormData({ ...formData, currentWorkout: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              >
                {[1, 2, 3].map((w) => (
                  <option key={w} value={w}>Workout {w}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500">Week</p>
              <p className="text-xl font-bold">{stats?.current_week || 1}</p>
            </div>
            <div className="flex-1 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500">Workout</p>
              <p className="text-xl font-bold">{stats?.current_workout_number || 1}</p>
            </div>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-4">Reminders</h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Enable notifications
            </span>
            <button
              onClick={() => setNotifPrefs((p) => ({ ...p, enabled: !p.enabled }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifPrefs.enabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                  notifPrefs.enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </label>

          {notifPrefs.enabled && (
            <>
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Morning nutrition check
                </label>
                <input
                  type="time"
                  value={notifPrefs.morning_check || "07:00"}
                  onChange={(e) =>
                    setNotifPrefs((p) => ({ ...p, morning_check: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Pre-workout meal reminder
                </label>
                <input
                  type="time"
                  value={notifPrefs.pre_workout || "16:00"}
                  onChange={(e) =>
                    setNotifPrefs((p) => ({ ...p, pre_workout: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Hydration reminders (every 2h)
                </span>
                <button
                  onClick={() => setNotifPrefs((p) => ({ ...p, hydration: !p.hydration }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifPrefs.hydration ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                      notifPrefs.hydration ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Daily supplement reminder
                </span>
                <button
                  onClick={() => setNotifPrefs((p) => ({ ...p, supplement: !p.supplement }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifPrefs.supplement ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                      notifPrefs.supplement ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </label>
            </>
          )}

          <p className="text-xs text-zinc-400">
            Reminders use browser notifications. You may need to allow notifications in your browser settings.
          </p>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 rounded-lg border border-zinc-200 py-3 text-base font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full rounded-xl border-2 border-red-200 py-4 text-base font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        {isLoggingOut ? "Logging out..." : "Log Out"}
      </button>
    </div>
  );
}
