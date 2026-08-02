"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/auth");
    }
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return <>{children}</>;
}
