"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createWeek } from "@/lib/actions/timesheet";
import { getWeekStart, toISODateString } from "@/lib/utils";

export function TimesheetNewWeekButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    const monday = getWeekStart(new Date());
    const weekStartStr = toISODateString(monday);

    startTransition(async () => {
      const result = await createWeek(weekStartStr);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.data) {
        router.push(`/timesheet/${result.data.id}`);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="primary"
        size="sm"
        onClick={handleCreate}
        loading={isPending}
        icon={<Plus className="h-4 w-4" />}
      >
        Nova Semana
      </Button>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
