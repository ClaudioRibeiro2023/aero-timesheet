import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aero Timesheet | Controle de Horas",
  description:
    "Sistema de registro e acompanhamento de horas trabalhadas para colaboradores da Aero Engenharia.",
  keywords: ["timesheet", "horas", "aero engenharia", "controle de ponto"],
  authors: [{ name: "Aero Engenharia" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans min-h-screen bg-surface-950 text-surface-50`}
      >
        <div className="relative min-h-screen">
          {/* Efeito de gradiente de fundo */}
          <div
            className="fixed inset-0 -z-10"
            aria-hidden="true"
          >
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}
