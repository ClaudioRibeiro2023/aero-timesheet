import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function TimesheetLoading() {
  return (
    <div className="relative min-h-[60vh]">
      <LoadingOverlay visible message="Carregando timesheet..." />
    </div>
  );
}
