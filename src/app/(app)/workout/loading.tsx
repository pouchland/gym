export default function WorkoutLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-36 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-6 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
