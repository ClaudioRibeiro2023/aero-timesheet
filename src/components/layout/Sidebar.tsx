"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Clock,
  LayoutDashboard,
  CalendarClock,
  CheckSquare,
  BarChart3,
  FolderKanban,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Timesheet", href: "/timesheet", icon: CalendarClock },
  { label: "Aprovações", href: "/aprovacoes", icon: CheckSquare },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Projetos", href: "/projetos", icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Botão mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800/80 backdrop-blur-sm border border-white/10 text-surface-300 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-surface-950/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header da sidebar */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600/20 border border-brand-500/30">
              <Clock className="h-5 w-5 text-brand-400" />
            </div>
            <span className="text-lg font-semibold text-surface-50">
              Aero<span className="text-brand-400">Time</span>
            </span>
          </Link>

          {/* Fechar mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:text-surface-200 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-600/15 text-brand-400 border border-brand-500/20 shadow-sm shadow-brand-500/10"
                    : "text-surface-400 hover:bg-white/5 hover:text-surface-200 border border-transparent"
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 shrink-0",
                    active ? "text-brand-400" : "text-surface-500"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da sidebar */}
        <div className="border-t border-white/5 p-4">
          <p className="text-xs text-surface-600 text-center">
            Aero Timesheet v0.1
          </p>
        </div>
      </aside>
    </>
  );
}
