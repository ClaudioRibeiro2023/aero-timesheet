import { type ReactNode } from "react";
import { clsx } from "clsx";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-800/50 border border-white/5 text-surface-500 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-surface-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
