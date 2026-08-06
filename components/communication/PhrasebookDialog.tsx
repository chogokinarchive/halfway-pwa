"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { speakJapanese } from "@/lib/speech";
import { VOCABULARY, EXPRESSIONS } from "@/lib/sample-data";
import type { ReactNode } from "react";

interface Entry {
  id: string;
  italian: string;
  japanese: string;
  reading?: string;
  english: string;
  tag: string;
}

const ALL_ENTRIES: Entry[] = [
  ...VOCABULARY.map((v) => ({ ...v, tag: v.category })),
  ...EXPRESSIONS.map((e) => ({ ...e, tag: e.context })),
];

export function PhrasebookDialog({ trigger }: { trigger: ReactNode }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ENTRIES.slice(0, 8);
    return ALL_ENTRIES.filter(
      (entry) =>
        entry.italian.toLowerCase().includes(q) ||
        entry.english.toLowerCase().includes(q) ||
        entry.japanese.includes(q) ||
        entry.reading?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("communication.phrasebookTitle")}</DialogTitle>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("communication.phrasebookPlaceholder")}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          {results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("communication.phrasebookNoResults")}
            </p>
          )}
          {results.map((entry) => (
            <button
              key={entry.id}
              onClick={() => speakJapanese(entry.japanese)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{entry.italian}</p>
                  <Badge variant="muted" className="text-[10px]">
                    {entry.tag}
                  </Badge>
                </div>
                <p className="text-sm">
                  {entry.japanese}
                  {entry.reading && (
                    <span className="text-muted-foreground"> · {entry.reading}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{entry.english}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
