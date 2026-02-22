"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.display_name) {
        setName(user.user_metadata.display_name);
      }
      setLoading(false);
    });
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const { error } = await supabase.auth.updateUser({
      data: { display_name: name.trim() },
    });

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-500">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-base outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>

        {saved && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Name updated!
          </p>
        )}

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
