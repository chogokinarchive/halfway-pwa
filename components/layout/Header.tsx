"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Languages, Settings, LogOut } from "lucide-react";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/lib/auth/context";

export function Header() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Languages className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight">{t("app.name")}</span>
        </Link>

        <div className="hidden flex-1 md:block" />

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="md:hidden"
            aria-label={t("nav.settings")}
          >
            <Link href="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
