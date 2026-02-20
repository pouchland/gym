import { BottomNav } from "@/components/layout/bottom-nav";
import { UsernameProvider } from "@/components/username-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UsernameProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <main className="mx-auto max-w-lg px-4 pb-24 pt-6">{children}</main>
        <BottomNav />
      </div>
    </UsernameProvider>
  );
}
