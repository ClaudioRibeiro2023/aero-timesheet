import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function WeekEditorLoading() {
  return (
    <div className="relative min-h-[60vh]">
      <LoadingOverlay visible message="Carregando semana..." />
    </div>
  );
}
