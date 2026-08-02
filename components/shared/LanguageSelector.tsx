"use client";

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LOCALES, useTranslation } from "@/lib/i18n/context";
import type { SupportedLocale } from "@/types";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  it: "Italiano",
  en: "English",
  ja: "日本語",
};

const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
  ja: "🇯🇵",
};

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          <span>{LOCALE_FLAGS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={() => setLocale(loc)}
            className={cn(loc === locale && "font-medium")}
          >
            <span className="mr-2">{LOCALE_FLAGS[loc]}</span>
            {LOCALE_LABELS[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
