export default function ProgramLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-8 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      ))}
    </div>
  );
}
