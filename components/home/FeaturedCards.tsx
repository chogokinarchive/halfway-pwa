"use client";

import { motion } from "framer-motion";
import { Sparkles, Landmark, CalendarHeart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

export function FeaturedCards() {
  const { t } = useTranslation();

  const items = [
    {
      icon: Sparkles,
      title: t("home.featured.wordOfDay"),
      description: t("home.featured.wordOfDayDesc"),
      accent: "text-primary bg-primary/10",
    },
    {
      icon: Landmark,
      title: t("home.featured.culturalTip"),
      description: t("home.featured.culturalTipDesc"),
      accent: "text-secondary bg-secondary/10",
    },
    {
      icon: CalendarHeart,
      title: t("home.featured.eventSpotlight"),
      description: t("home.featured.eventSpotlightDesc"),
      accent: "text-foreground bg-muted",
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{t("home.featuredTitle")}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${item.accent}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
