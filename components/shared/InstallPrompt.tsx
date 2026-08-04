"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "halfway-install-dismissed";

/**
 * Renders nothing on the server and on first client paint; only becomes
 * visible after the browser fires `beforeinstallprompt`, which happens
 * well after hydration. This keeps SSR and initial client HTML identical.
 */
export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      if (dismissed) return;

      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  const dismiss = () => {
    setVisible(false);
    window.localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-lg animate-slide-up md:bottom-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium">{t("common.install")}</p>
            <p className="text-xs text-muted-foreground">{t("common.installDesc")}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={install}>
              {t("common.installAction")}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              {t("common.dismiss")}
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
