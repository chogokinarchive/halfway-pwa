"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard, type FeedPost } from "@/components/community/PostCard";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";

export default function PostDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams<{ postId: string }>();
  const postId = params.postId;

  const [post, setPost] = useState<FeedPost | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("posts_feed")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    setPost((data as FeedPost) ?? null);
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/community")}>
        <ArrowLeft className="h-4 w-4" />
        Community
      </Button>

      {post === undefined && !error && <LoadingScreen />}
      {error && <ErrorState description={error} onRetry={loadPost} />}
      {post === null && !error && (
        <ErrorState title="Post not found" description="" onRetry={loadPost} />
      )}
      {post && <PostCard post={post} currentUserId={user.id} />}
    </div>
  );
}
