"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchBar({ value, onChange, className, placeholder }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? t("common.searchPlaceholder")}
        aria-label={t("common.search")}
        className="pl-10"
      />
    </div>
  );
}
