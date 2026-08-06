"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface FeatureTileProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  comingSoon?: boolean;
}

export function FeatureTile({ icon: Icon, title, description, onClick, comingSoon }: FeatureTileProps) {
  const { t } = useTranslation();

  return (
    <Card
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-shadow hover:shadow-md" : undefined}
    >
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{title}</p>
            {comingSoon && (
              <Badge variant="muted" className="text-[10px]">
                {t("communication.comingSoon")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
