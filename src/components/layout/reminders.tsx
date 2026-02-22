"use client";

import { useUserStats } from "@/lib/hooks/use-user-stats";
import { useReminders } from "@/lib/hooks/use-reminders";

export function Reminders() {
  const { stats } = useUserStats();
  useReminders(stats?.notification_preferences);
  return null;
}
