"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookMarked, Flame, BookOpenCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VocabularyCard } from "@/components/learning/VocabularyCard";
import { ExpressionCard } from "@/components/learning/ExpressionCard";
import { ComingSoonSection } from "@/components/learning/ComingSoonSection";
import { GrammarSection } from "@/components/learning/GrammarSection";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";
import { VOCABULARY, EXPRESSIONS } from "@/lib/sample-data";
import type { VocabularyProgressRow } from "@/types/database";

export default function LearningPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [progressRows, setProgressRows] = useState<Map<string, VocabularyProgressRow> | null>(
    null
  );
  const [stats, setStats] = useState<{ words: number; streak: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(VOCABULARY.map((item) => item.category))),
    []
  );

  const visibleVocabulary = selectedCategory
    ? VOCABULARY.filter((item) => item.category === selectedCategory)
    : VOCABULARY;

  const loadProgress = useCallback(async () => {
    if (!user) return;

    const [progressRes, statsRes] = await Promise.all([
      supabase.from("vocabulary_progress").select("*").eq("user_id", user.id),
      supabase
        .from("learning_progress")
        .select("words_learned, streak")
        .eq("user_id", user.id)
        .single(),
    ]);

    const map = new Map<string, VocabularyProgressRow>();
    progressRes.data?.forEach((row) => map.set(row.vocabulary_id, row));
    setProgressRows(map);

    setStats({
      words: statsRes.data?.words_learned ?? 0,
      streak: statsRes.data?.streak ?? 0,
    });
  }, [user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (!user || progressRows === null) {
    return null;
  }

  const savedVocabulary = VOCABULARY.filter((item) => progressRows.get(item.id)?.saved);
  const savedExpressions = EXPRESSIONS.filter((item) => progressRows.get(item.id)?.saved);
  const hasSavedItems = savedVocabulary.length > 0 || savedExpressions.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("learning.title")}</h1>
        <p className="text-muted-foreground">{t("learning.subtitle")}</p>
      </div>

      <Tabs defaultValue="vocabulary">
        <TabsList>
          <TabsTrigger value="vocabulary">{t("learning.tabs.vocabulary")}</TabsTrigger>
          <TabsTrigger value="expressions">{t("learning.tabs.expressions")}</TabsTrigger>
          <TabsTrigger value="grammar">{t("learning.tabs.grammar")}</TabsTrigger>
          <TabsTrigger value="progress">{t("learning.tabs.progress")}</TabsTrigger>
          <TabsTrigger value="bookmarks">{t("learning.tabs.bookmarks")}</TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              {t("learning.allCategories")}
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVocabulary.map((item) => (
              <VocabularyCard
                key={item.id}
                item={item}
                userId={user.id}
                initialSaved={progressRows.get(item.id)?.saved ?? false}
                initialLearned={progressRows.get(item.id)?.learned ?? false}
                onProgressChange={loadProgress}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expressions">
          <div className="grid gap-3 sm:grid-cols-2">
            {EXPRESSIONS.map((item) => (
              <ExpressionCard
                key={item.id}
                item={item}
                userId={user.id}
                initialSaved={progressRows.get(item.id)?.saved ?? false}
                initialLearned={progressRows.get(item.id)?.learned ?? false}
                onProgressChange={loadProgress}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grammar">
          <GrammarSection
            italianTitle={t("learning.grammar.italianTitle")}
            japaneseTitle={t("learning.grammar.japaneseTitle")}
            italianLessons={[1, 2, 3, 4].map((n) => ({
              title: t(`learning.grammar.lessons.it${n}Title`),
              description: t(`learning.grammar.lessons.it${n}Desc`),
            }))}
            japaneseLessons={[1, 2, 3, 4].map((n) => ({
              title: t(`learning.grammar.lessons.ja${n}Title`),
              description: t(`learning.grammar.lessons.ja${n}Desc`),
            }))}
          />
        </TabsContent>

        <TabsContent value="progress">
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <Card className="flex flex-col items-center gap-1.5 p-4 text-center">
                <Flame className="h-5 w-5 text-primary" />
                <p className="text-xl font-semibold tracking-tight">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">{t("profile.stats.streak")}</p>
              </Card>
              <Card className="flex flex-col items-center gap-1.5 p-4 text-center">
                <BookOpenCheck className="h-5 w-5 text-primary" />
                <p className="text-xl font-semibold tracking-tight">{stats.words}</p>
                <p className="text-xs text-muted-foreground">{t("profile.stats.words")}</p>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks">
          {!hasSavedItems ? (
            <ComingSoonSection
              icon={BookMarked}
              title={t("learning.bookmarks.comingSoonTitle")}
              description={t("learning.bookmarks.comingSoonDesc")}
            />
          ) : (
            <div className="space-y-6">
              {savedVocabulary.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {savedVocabulary.map((item) => (
                    <VocabularyCard
                      key={item.id}
                      item={item}
                      userId={user.id}
                      initialSaved
                      initialLearned={progressRows.get(item.id)?.learned ?? false}
                      onProgressChange={loadProgress}
                    />
                  ))}
                </div>
              )}
              {savedExpressions.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedExpressions.map((item) => (
                    <ExpressionCard
                      key={item.id}
                      item={item}
                      userId={user.id}
                      initialSaved
                      initialLearned={progressRows.get(item.id)?.learned ?? false}
                      onProgressChange={loadProgress}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
