export default function HomeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="h-36 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
