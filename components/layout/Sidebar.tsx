"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GraduationCap,
  Users,
  MessageCircle,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Home,
  GraduationCap,
  Users,
  MessageCircle,
  User,
};

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background px-4 py-6 md:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-xl" />
        <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          pathname === "/settings"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Settings className="h-4 w-4" />
        {t("nav.settings")}
      </Link>
    </aside>
  );
}
