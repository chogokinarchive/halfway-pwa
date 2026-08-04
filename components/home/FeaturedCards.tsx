"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Landmark, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle as DialogTitleUi,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase/client";
import { VOCABULARY } from "@/lib/sample-data";

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function FeaturedCards() {
  const { t } = useTranslation();
  const router = useRouter();

  // Deterministic default (matches SSR); real value is set client-side
  // after mount, so this never causes a hydration mismatch.
  const [dayIndex, setDayIndex] = useState(0);
  const [postsToday, setPostsToday] = useState<number | null>(null);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);

  useEffect(() => {
    setDayIndex(dayOfYear(new Date()));
  }, []);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since.toISOString());
      setPostsToday(count ?? 0);
    })();
  }, []);

  const wordOfDay = VOCABULARY[dayIndex % VOCABULARY.length];
  const culturalTips = t("home.featured.culturalTips") as unknown as string[];
  const tipsArray = Array.isArray(culturalTips) ? culturalTips : [];
  const tipOfDay = tipsArray[dayIndex % (tipsArray.length || 1)] ?? "";

  const eventDescription =
    postsToday === null
      ? t("home.featured.eventSpotlightDesc")
      : t("home.featured.eventCountToday").replace("{count}", String(postsToday));

  const items = [
    {
      icon: Sparkles,
      title: t("home.featured.wordOfDay"),
      description: wordOfDay ? `${wordOfDay.italian} · ${wordOfDay.japanese}` : "",
      accent: "text-primary bg-primary/10",
      onClick: () => router.push("/learning"),
    },
    {
      icon: Landmark,
      title: t("home.featured.culturalTip"),
      description: tipOfDay,
      accent: "text-secondary bg-secondary/10",
      onClick: () => setTipDialogOpen(true),
      truncate: true,
    },
    {
      icon: Users,
      title: t("home.featured.eventSpotlight"),
      description: eventDescription,
      accent: "text-foreground bg-muted",
      onClick: () => router.push("/community"),
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{t("home.featuredTitle")}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <motion.button
            key={item.title}
            type="button"
            onClick={item.onClick}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
            className="text-left"
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${item.accent}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription className={item.truncate ? "line-clamp-2" : undefined}>
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.button>
        ))}
      </div>

      <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitleUi>{t("home.featured.culturalTip")}</DialogTitleUi>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">{tipOfDay}</p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
