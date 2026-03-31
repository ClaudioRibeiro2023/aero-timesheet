"use client";

import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, ChevronRight, User as UserIcon } from "lucide-react";

interface HeaderProps {
  userName: string | null;
  userEmail: string | null;
}

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  timesheet: "Timesheet",
  aprovacoes: "Aprovações",
  relatorios: "Relatórios",
  projetos: "Projetos",
};

export function Header({ userName, userEmail }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment) => ({
    label: breadcrumbLabels[segment] ?? segment,
    segment,
  }));

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = userName ?? userEmail ?? "Usuário";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-surface-950/80 backdrop-blur-xl px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm pl-12 lg:pl-0" aria-label="Navegação">
        <span className="text-surface-500">Aero Timesheet</span>
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.segment} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-surface-600" />
            <span
              className={
                index === breadcrumbs.length - 1
                  ? "text-surface-200 font-medium"
                  : "text-surface-400"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Usuário + Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/20 border border-brand-500/30 text-sm font-semibold text-brand-400">
            {initials || <UserIcon className="h-4 w-4" />}
          </div>

          {/* Nome */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-surface-200 leading-tight">
              {displayName}
            </p>
            {userEmail && userName && (
              <p className="text-xs text-surface-500 leading-tight">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Botão logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-surface-400 transition-colors hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
