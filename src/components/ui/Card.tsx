import { type HTMLAttributes } from "react";
import { clsx } from "clsx";

type CardVariant = "default" | "elevated" | "glass";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-surface-900/50 border border-white/5 rounded-2xl",
  elevated:
    "bg-surface-900/70 border border-white/10 rounded-2xl shadow-xl shadow-black/20",
  glass:
    "glass rounded-2xl",
};

export function Card({
  variant = "default",
  padding = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        variantStyles[variant],
        padding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx("text-lg font-semibold text-surface-100", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx("text-sm text-surface-400 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(className)} {...props}>
      {children}
    </div>
  );
}
