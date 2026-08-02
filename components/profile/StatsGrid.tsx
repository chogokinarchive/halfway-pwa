"use client";

import { Flame, BookOpenCheck, Repeat2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

interface Stats {
  streak: number;
  words: number;
  exchanges: number;
  friends: number;
}

export function StatsGrid({ stats }: { stats: Stats }) {
  const { t } = useTranslation();

  const items = [
    { icon: Flame, label: t("profile.stats.streak"), value: stats.streak },
    { icon: BookOpenCheck, label: t("profile.stats.words"), value: stats.words },
    { icon: Repeat2, label: t("profile.stats.exchanges"), value: stats.exchanges },
    { icon: Users, label: t("profile.stats.friends"), value: stats.friends },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="flex flex-col items-center gap-1.5 p-4 text-center">
          <item.icon className="h-5 w-5 text-primary" />
          <p className="text-xl font-semibold tracking-tight">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}
