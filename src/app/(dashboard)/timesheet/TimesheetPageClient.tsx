"use client";

import { useState, useCallback } from "react";
import { WeeklyGrid } from "@/components/timesheet/WeeklyGrid";
import type { Project, TimesheetEntry, TimesheetStatus } from "@/types/database";

interface TimesheetPageClientProps {
  projects: Project[];
  initialEntries: TimesheetEntry[];
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function TimesheetPageClient({
  projects,
  initialEntries,
}: TimesheetPageClientProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [status] = useState<TimesheetStatus>("rascunho");

  const handleWeekChange = useCallback((newStart: Date) => {
    setWeekStart(newStart);
    // TODO: fetch entries for the new week
  }, []);

  return (
    <WeeklyGrid
      projects={projects}
      initialEntries={initialEntries}
      weekStart={weekStart}
      onWeekChange={handleWeekChange}
      status={status}
    />
  );
}
