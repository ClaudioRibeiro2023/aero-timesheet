import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function DashboardLoading() {
  return (
    <div className="relative min-h-[60vh]">
      <LoadingOverlay visible message="Carregando dashboard..." />
    </div>
  );
}
