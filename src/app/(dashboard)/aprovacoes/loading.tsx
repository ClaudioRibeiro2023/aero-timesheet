import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function AprovacoesLoading() {
  return (
    <div className="relative min-h-[60vh]">
      <LoadingOverlay visible message="Carregando aprovações..." />
    </div>
  );
}
