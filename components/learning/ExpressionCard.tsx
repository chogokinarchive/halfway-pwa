"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase/client";
import { speakJapanese } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { ExpressionItem } from "@/types";

interface ExpressionCardProps {
  item: ExpressionItem;
  userId: string;
  initialSaved: boolean;
  initialLearned: boolean;
  onProgressChange?: () => void;
}

export function ExpressionCard({
  item,
  userId,
  initialSaved,
  initialLearned,
  onProgressChange,
}: ExpressionCardProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(initialLearned);
  const [saved, setSaved] = useState(initialSaved);

  const upsertProgress = async (fields: { saved?: boolean; learned?: boolean }) => {
    await supabase
      .from("vocabulary_progress")
      .upsert(
        { user_id: userId, vocabulary_id: item.id, ...fields },
        { onConflict: "user_id,vocabulary_id", ignoreDuplicates: false }
      );
    onProgressChange?.();
  };

  const toggleSaved = async () => {
    const next = !saved;
    setSaved(next);
    await upsertProgress({ saved: next });
  };

  const reveal = async () => {
    if (revealed) return;
    setRevealed(true);
    await upsertProgress({ learned: true });
  };

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <Badge variant="outline">{item.context}</Badge>
          <div className="flex items-center gap-1">
            <button
              aria-label="Play pronunciation"
              onClick={() => speakJapanese(item.japanese)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              aria-label={t("learning.vocabulary.saved")}
              onClick={toggleSaved}
              className={cn(
                "rounded-lg p-1.5 transition-colors hover:bg-accent",
                saved ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-primary")} />
            </button>
          </div>
        </div>

        <div className="grid gap-1 sm:grid-cols-2">
          <p className="font-medium">{item.italian}</p>
          <div>
            <p className="font-medium">{item.japanese}</p>
            {item.reading && <p className="text-xs text-muted-foreground">{item.reading}</p>}
          </div>
        </div>

        <button
          onClick={reveal}
          className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent"
        >
          {revealed ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-foreground"
            >
              {item.english}
            </motion.span>
          ) : (
            t("learning.vocabulary.reveal")
          )}
        </button>
      </CardContent>
    </Card>
  );
}
