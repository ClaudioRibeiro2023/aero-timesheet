import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    null;
  const userEmail = user.email ?? null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <Header userName={userName} userEmail={userEmail} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
