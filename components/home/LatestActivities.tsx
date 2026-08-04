"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRelativeFromFixedPoint } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase/client";

interface RecentPost {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export function LatestActivities() {
  const { t, locale } = useTranslation();
  const [posts, setPosts] = useState<RecentPost[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("posts_feed")
        .select("id, author_name, content, created_at")
        .limit(3);
      setPosts(data ?? []);
    })();
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{t("home.activitiesTitle")}</h2>
        <Link href="/community" className="text-sm font-medium text-primary hover:underline">
          {t("common.seeAll")}
        </Link>
      </div>

      {posts !== null && posts.length === 0 && (
        <EmptyState icon={MessageSquare} title={t("community.newPost")} className="py-8" />
      )}

      {posts && posts.length > 0 && (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-accent"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{post.author_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-snug">{post.author_name}</p>
                  <p className="truncate text-sm text-muted-foreground">{post.content}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeFromFixedPoint(post.created_at, new Date().toISOString(), locale)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
