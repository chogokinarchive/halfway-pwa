"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title ?? t("common.errorTitle")}</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          {description ?? t("common.errorDesc")}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
