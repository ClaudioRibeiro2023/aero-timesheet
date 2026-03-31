import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function RelatoriosLoading() {
  return (
    <div className="relative min-h-[60vh]">
      <LoadingOverlay visible message="Carregando relatórios..." />
    </div>
  );
}
