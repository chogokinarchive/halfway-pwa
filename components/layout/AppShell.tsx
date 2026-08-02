"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { InstallPrompt } from "@/components/shared/InstallPrompt";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <ServiceWorkerRegister />
      <OfflineBanner />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
