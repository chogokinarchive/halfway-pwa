"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GraduationCap,
  Users,
  MessageCircle,
  User,
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

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-primary/10")} />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
