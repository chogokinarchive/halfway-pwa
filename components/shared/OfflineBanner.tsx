"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!window.navigator.onLine);
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-xs font-medium text-background animate-fade-in">
      <WifiOff className="h-3.5 w-3.5" />
      {t("common.offline")}
    </div>
  );
}
