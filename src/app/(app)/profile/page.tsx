"use client";

import { useUsername } from "@/components/username-provider";
import { useState } from "react";

export default function ProfilePage() {
  const { username, setUsername } = useUsername();
  const [name, setName] = useState(username ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      setUsername(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

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
