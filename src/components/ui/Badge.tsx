import { type HTMLAttributes } from "react";
import { clsx } from "clsx";

type BadgeVariant = "draft" | "submitted" | "approved" | "rejected" | "default";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  draft:
    "bg-surface-600/20 text-surface-300 border-surface-500/20",
  submitted:
    "bg-blue-500/15 text-blue-400 border-blue-500/20",
  approved:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected:
    "bg-red-500/15 text-red-400 border-red-500/20",
  default:
    "bg-surface-600/20 text-surface-300 border-surface-500/20",
};

const variantLabels: Record<BadgeVariant, string> = {
  draft: "Rascunho",
  submitted: "Enviado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  default: "",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children ?? variantLabels[variant]}
    </span>
  );
}
