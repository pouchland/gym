"use client";

import { useCallback, useEffect, useRef } from "react";
import type { NotificationPreferences } from "./use-user-stats";

const REMINDER_MESSAGES: Record<string, { title: string; body: string }> = {
  morning_check: {
    title: "Morning Nutrition Check",
    body: "Start your day right — check your nutrition targets and plan your meals.",
  },
  pre_workout: {
    title: "Pre-Workout Fuel",
    body: "Time to eat! Get your pre-workout meal in 1-2 hours before training.",
  },
  hydration: {
    title: "Hydration Reminder",
    body: "Have you been drinking enough water? Stay on top of your hydration target.",
  },
  supplement: {
    title: "Supplement Reminder",
    body: "Don't forget your daily supplements — check them off in the app.",
  },
};

function getMillisUntilTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If the time has passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

export function useReminders(preferences: NotificationPreferences | null | undefined) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, []);

  const showNotification = useCallback((type: string) => {
    const msg = REMINDER_MESSAGES[type];
    if (!msg) return;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(msg.title, {
        body: msg.body,
        icon: "/icons/icon-192x192.png",
      });
    }
  }, []);

  const scheduleReminder = useCallback(
    (type: string, timeStr: string) => {
      const ms = getMillisUntilTime(timeStr);
      const timer = setTimeout(() => {
        showNotification(type);
        // Reschedule for next day
        scheduleReminder(type, timeStr);
      }, ms);
      timersRef.current.push(timer);
    },
    [showNotification],
  );

  const cancelAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!preferences?.enabled) {
      cancelAll();
      return;
    }

    // Request permission on mount if reminders are enabled
    requestPermission().then((granted) => {
      if (!granted) return;

      cancelAll();

      if (preferences.morning_check) {
        scheduleReminder("morning_check", preferences.morning_check);
      }
      if (preferences.pre_workout) {
        scheduleReminder("pre_workout", preferences.pre_workout);
      }
      // Hydration: reminder every 2 hours during waking hours (8am-10pm)
      if (preferences.hydration) {
        for (let h = 8; h <= 20; h += 2) {
          scheduleReminder("hydration", `${h.toString().padStart(2, "0")}:00`);
        }
      }
      // Supplement: once in the morning
      if (preferences.supplement) {
        scheduleReminder("supplement", "09:00");
      }
    });

    return cancelAll;
  }, [preferences, requestPermission, scheduleReminder, cancelAll]);

  return { requestPermission, cancelAll };
}
