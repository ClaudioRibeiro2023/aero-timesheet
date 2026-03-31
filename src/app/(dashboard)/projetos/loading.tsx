import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function ProjetosLoading() {
  return (
    <div className="relative min-h-[60vh]">
      <LoadingOverlay visible message="Carregando projetos..." />
    </div>
  );
}
