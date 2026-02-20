"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        if (profile) {
          setDisplayName(profile.display_name ?? "");
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      setMessage("Failed to update profile");
    } else {
      setMessage("Profile updated");
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex h-32 items-center justify-center rounded-xl bg-white dark:bg-zinc-900">
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-500">Email</label>
          <p className="text-base">{email}</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-500">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>

        {message && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <button
        onClick={handleSignOut}
        className="w-full rounded-xl border border-red-200 bg-white py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-zinc-900 dark:hover:bg-red-950"
      >
        Sign Out
      </button>
    </div>
  );
}
