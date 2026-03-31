import { clsx } from "clsx";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  visible,
  message = "Carregando...",
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={clsx(
        "flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50",
        fullScreen ? "fixed inset-0" : "absolute inset-0 rounded-2xl"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner CSS */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-400 animate-spin" />
        </div>

        <p className="text-sm text-surface-300 font-medium">{message}</p>
      </div>
    </div>
  );
}
