"use client";

import { useCallback, useEffect, useState } from "react";
import { PostCard, type FeedPost } from "@/components/community/PostCard";
import { UserCard } from "@/components/community/UserCard";
import { NewPostDialog } from "@/components/community/NewPostDialog";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";
import { MessageSquare } from "lucide-react";

export default function CommunityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [people, setPeople] = useState<ProfileRow[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    if (!user) return;
    setError(null);

    const [postsRes, connectionsRes] = await Promise.all([
      supabase.from("posts_feed").select("*").limit(30),
      supabase.from("connections").select("user_a, user_b").or(
        `user_a.eq.${user.id},user_b.eq.${user.id}`
      ),
    ]);

    if (postsRes.error) {
      setError(postsRes.error.message);
      return;
    }
    setPosts((postsRes.data as FeedPost[]) ?? []);

    const connected = new Set<string>();
    connectionsRes.data?.forEach((row) => {
      connected.add(row.user_a === user.id ? row.user_b : row.user_a);
    });
    setConnectedIds(connected);

    const { data: peopleData } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .limit(10);
    setPeople(peopleData ?? []);
  }, [user]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("ring-2", "ring-primary");
      const timeout = setTimeout(() => {
        target.classList.remove("ring-2", "ring-primary");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [posts]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("community.title")}</h1>
          <p className="text-muted-foreground">{t("community.subtitle")}</p>
        </div>
        <NewPostDialog authorId={user.id} onCreated={loadFeed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {posts === null && !error && <LoadingScreen />}
          {error && <ErrorState description={error} onRetry={loadFeed} />}
          {posts !== null && posts.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title={t("community.newPost")}
              description={t("community.subtitle")}
            />
          )}
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user.id} />
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t("community.peopleToMeet")}
          </h2>
          <div className="space-y-3">
            {people.map((profile) => (
              <UserCard
                key={profile.id}
                profile={profile}
                currentUserId={user.id}
                alreadyConnected={connectedIds.has(profile.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
