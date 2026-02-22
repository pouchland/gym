"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  days_per_week: number;
  difficulty: string;
  goal: string;
  duration_weeks: number;
  science_basis: string;
  key_principles: string[];
}

export interface ProgramWeek {
  id: string;
  program_id: string;
  week_number: number;
  phase: string;
  focus: string;
  notes: string;
}

export interface ProgramWorkout {
  id: string;
  program_id: string;
  week_id: string;
  workout_number: number;
  name: string;
  focus: string;
  target_duration_minutes: number | null;
  rpe_target: number | null;
}

export function useProgramTemplates() {
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("program_templates")
        .select("*")
        .order("days_per_week");

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTemplates(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}

export function useProgramTemplate(programId: string | null) {
  const [template, setTemplate] = useState<ProgramTemplate | null>(null);
  const [weeks, setWeeks] = useState<ProgramWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProgram = useCallback(async () => {
    if (!programId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from("program_templates")
        .select("*")
        .eq("id", programId)
        .single();

      if (templateError) {
        setError(templateError.message);
        setLoading(false);
        return;
      }

      setTemplate(templateData);

      // Fetch weeks
      const { data: weeksData, error: weeksError } = await supabase
        .from("program_weeks")
        .select("*")
        .eq("program_id", programId)
        .order("week_number");

      if (weeksError) {
        setError(weeksError.message);
      } else {
        setWeeks(weeksData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [supabase, programId]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  return { template, weeks, loading, error, refetch: fetchProgram };
}

export function useCurrentWeekWorkouts(programId: string | null, weekNumber: number) {
  const [workouts, setWorkouts] = useState<ProgramWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!programId) {
      setLoading(false);
      return;
    }

    const fetchWorkouts = async () => {
      const { data: weekData } = await supabase
        .from("program_weeks")
        .select("id")
        .eq("program_id", programId)
        .eq("week_number", weekNumber)
        .single();

      if (!weekData) {
        setLoading(false);
        return;
      }

      const { data: workoutsData } = await supabase
        .from("program_workouts")
        .select("*")
        .eq("week_id", weekData.id)
        .order("workout_number");

      setWorkouts(workoutsData || []);
      setLoading(false);
    };

    fetchWorkouts();
  }, [supabase, programId, weekNumber]);

  return { workouts, loading };
}
