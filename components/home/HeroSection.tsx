"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, UserPlus, Users2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";

export function HeroSection() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus,
      title: t("home.howItWorks.step1Title"),
      desc: t("home.howItWorks.step1Desc"),
    },
    {
      icon: Users2,
      title: t("home.howItWorks.step2Title"),
      desc: t("home.howItWorks.step2Desc"),
    },
    {
      icon: MessageSquareText,
      title: t("home.howItWorks.step3Title"),
      desc: t("home.howItWorks.step3Desc"),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 sm:p-10"
    >
      <div className="relative z-10 max-w-xl space-y-4">
        <span className="inline-flex items-center rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
          🇮🇹 &nbsp;×&nbsp; 🇯🇵
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("home.heroTitle")}
        </h1>
        <p className="text-muted-foreground sm:text-lg">{t("home.heroSubtitle")}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/community">
              {t("home.heroCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="ghost" className="gap-2">
                <PlayCircle className="h-4 w-4" />
                {t("home.heroSecondaryCta")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("home.howItWorks.title")}</DialogTitle>
                <DialogDescription>{t("home.howItWorks.intro")}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <DialogClose asChild>
                <Button className="mt-6 w-full">{t("home.howItWorks.cta")}</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-16 h-56 w-56 rounded-full bg-secondary/10 blur-3xl"
      />
    </motion.section>
  );
}
