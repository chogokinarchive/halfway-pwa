"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">{t("common.loading")}…</p>
    </div>
  );
}
