"use client";

import Link from "next/link";
import { BookOpen, UserPlus, Users, MessageCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    { icon: BookOpen, label: t("home.quickActions.practice"), href: "/learning" },
    { icon: UserPlus, label: t("home.quickActions.findPartner"), href: "/community" },
    { icon: Users, label: t("home.quickActions.joinCommunity"), href: "/community" },
    { icon: MessageCircle, label: t("home.quickActions.startChat"), href: "/communication" },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{t("home.quickActionsTitle")}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium transition-colors hover:bg-accent"
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <action.icon className="h-5 w-5" />
            </span>
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
