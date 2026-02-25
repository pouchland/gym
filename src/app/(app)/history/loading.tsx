export default function HistoryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      ))}
    </div>
  );
}
