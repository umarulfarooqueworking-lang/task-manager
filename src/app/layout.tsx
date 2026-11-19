import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "TaskFlow | Role-Based Task Management",
  description:
    "Enterprise role-based task management web application built with Next.js 14, Supabase, TypeScript, Tailwind CSS, and Zod.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 font-sans antialiased">
        <DataProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </DataProvider>
      </body>
    </html>
  );
}
