"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WeekNavigatorProps {
  weekStart: Date;
  onWeekChange: (newStart: Date) => void;
}

function formatWeekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  return `Semana de ${fmt(start)} a ${fmt(end)}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function WeekNavigator({ weekStart, onWeekChange }: WeekNavigatorProps) {
  const goToPrev = useCallback(() => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    onWeekChange(prev);
  }, [weekStart, onWeekChange]);

  const goToNext = useCallback(() => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    onWeekChange(next);
  }, [weekStart, onWeekChange]);

  const goToToday = useCallback(() => {
    onWeekChange(getMonday(new Date()));
  }, [onWeekChange]);

  const isCurrentWeek =
    getMonday(new Date()).getTime() === weekStart.getTime();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrev}
          aria-label="Semana anterior"
          icon={<ChevronLeft className="h-4 w-4" />}
        />

        <span className="text-sm font-medium text-surface-200 min-w-[200px] text-center">
          {formatWeekLabel(weekStart)}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          aria-label="Próxima semana"
          icon={<ChevronRight className="h-4 w-4" />}
        />
      </div>

      {!isCurrentWeek && (
        <Button
          variant="secondary"
          size="sm"
          onClick={goToToday}
          icon={<CalendarDays className="h-4 w-4" />}
        >
          Hoje
        </Button>
      )}
    </div>
  );
}
