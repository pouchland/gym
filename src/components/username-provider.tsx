"use client";

import { createContext, useContext, useState, useEffect } from "react";

const UsernameContext = createContext<{
  username: string | null;
  setUsername: (name: string) => void;
}>({ username: null, setUsername: () => {} });

export function useUsername() {
  return useContext(UsernameContext);
}

export function UsernameProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gym_username");
    if (stored) setUsernameState(stored);
    setLoaded(true);
  }, []);

  function setUsername(name: string) {
    localStorage.setItem("gym_username", name);
    setUsernameState(name);
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!username) {
    return <UsernamePrompt onSubmit={setUsername} />;
  }

  return (
    <UsernameContext.Provider value={{ username, setUsername }}>
      {children}
    </UsernameContext.Provider>
  );
}

function UsernamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gym Tracker</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your name to get started
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSubmit(name.trim());
          }}
          className="space-y-3"
        >
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Let&apos;s Go
          </button>
        </form>
      </div>
    </div>
  );
}
