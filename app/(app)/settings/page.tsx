"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  Mail,
  Shield,
  UserCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingRow } from "@/components/settings/SettingRow";
import { useTranslation } from "@/hooks/useTranslation";
import { SUPPORTED_LOCALES } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";
import type { SupportedLocale } from "@/types";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  it: "Italiano",
  en: "English",
  ja: "日本語",
};

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { profile, user, signOut, refreshProfile } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const themeOptions: { value: string; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: t("settings.themeLight") },
    { value: "dark", icon: Moon, label: t("settings.themeDark") },
    { value: "system", icon: Monitor, label: t("settings.themeSystem") },
  ];

  const updateNotificationPref = async (
    field: "push_notifications" | "email_notifications",
    value: boolean
  ) => {
    if (!user) return;
    await supabase.from("profiles").update({ [field]: value }).eq("id", user.id);
    await refreshProfile();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">
          {t("settings.appearance")}
        </h2>
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium">{t("settings.theme")}</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border border-border px-3 py-3 text-xs font-medium transition-colors hover:bg-accent",
                    mounted && theme === option.value && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">
          {t("settings.language")}
        </h2>
        <Card>
          <CardContent className="p-2">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent",
                  loc === locale && "text-primary"
                )}
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {LOCALE_LABELS[loc]}
                </span>
                {loc === locale && (
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">
          {t("settings.notifications")}
        </h2>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            <SettingRow
              icon={Bell}
              label={t("settings.notificationsPush")}
              control={
                <Switch
                  checked={profile?.push_notifications ?? true}
                  onCheckedChange={(value) => updateNotificationPref("push_notifications", value)}
                />
              }
            />
            <SettingRow
              icon={Mail}
              label={t("settings.notificationsEmail")}
              control={
                <Switch
                  checked={profile?.email_notifications ?? false}
                  onCheckedChange={(value) =>
                    updateNotificationPref("email_notifications", value)
                  }
                />
              }
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">
          {t("settings.privacy")}
        </h2>
        <Card>
          <CardContent className="p-4">
            <SettingRow
              icon={Shield}
              label={t("settings.privacy")}
              description={t("settings.privacyComingSoon")}
              control={<span className="text-xs text-muted-foreground">—</span>}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">
          {t("settings.account")}
        </h2>
        <Card>
          <CardContent className="space-y-2 p-4">
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/profile">
                <UserCircle className="h-4 w-4" />
                {t("profile.editProfile")}
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={signOut}>
              {t("settings.signOut")}
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
