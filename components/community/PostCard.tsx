"use client";

import { useState } from "react";
import { Heart, MessageCircle, Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRelativeFromFixedPoint } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { PostCommentWithAuthor } from "@/types/database";

export interface FeedPost {
  id: string;
  author_id: string;
  author_name: string;
  author_country: string;
  author_avatar_url: string | null;
  content: string;
  media_url: string | null;
  media_type: "image" | "video" | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

export function PostCard({
  post,
  currentUserId,
}: {
  post: FeedPost;
  currentUserId: string;
}) {
  const { t, locale } = useTranslation();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [likeBusy, setLikeBusy] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<PostCommentWithAuthor[] | null>(null);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const toggleLike = async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    if (wasLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: currentUserId });
    }
    setLikeBusy(false);
  };

  const loadComments = async () => {
    setCommentsOpen((open) => !open);
    if (comments !== null) return;
    setLoadingComments(true);
    const { data } = await supabase
      .from("post_comments")
      .select("id, post_id, author_id, content, created_at, author:profiles(id, name)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    setComments((data as unknown as PostCommentWithAuthor[]) ?? []);
    setLoadingComments(false);
  };

  const submitComment = async () => {
    const content = newComment.trim();
    if (!content || postingComment) return;
    setPostingComment(true);

    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: post.id, author_id: currentUserId, content })
      .select("id, post_id, author_id, content, created_at, author:profiles(id, name)")
      .single();

    if (!error && data) {
      setComments((prev) => [...(prev ?? []), data as unknown as PostCommentWithAuthor]);
      setCommentCount((c) => c + 1);
      setNewComment("");
    }
    setPostingComment(false);
  };

  return (
    <Card id={`post-${post.id}`} className="scroll-mt-20 transition-shadow">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            {post.author_avatar_url && <AvatarImage src={post.author_avatar_url} alt="" />}
            <AvatarFallback>{post.author_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{post.author_name}</p>
              {post.author_country && (
                <Badge variant="outline" className="text-[10px]">
                  {post.author_country}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatRelativeFromFixedPoint(post.created_at, new Date().toISOString(), locale)}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed">{post.content}</p>

        {post.media_url && post.media_type === "video" && (
          <video
            src={post.media_url}
            controls
            className="max-h-[32rem] w-full rounded-xl bg-muted"
          />
        )}
        {post.media_url && post.media_type === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.media_url}
            alt=""
            className="max-h-[32rem] w-full rounded-xl bg-muted object-contain"
            loading="lazy"
          />
        )}

        <div className="flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
          <button
            onClick={toggleLike}
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-foreground",
              liked && "text-primary"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-primary")} />
            {likeCount} {t("community.likes")}
          </button>
          <button
            onClick={loadComments}
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount} {t("community.comments")}
          </button>
        </div>

        {commentsOpen && (
          <div className="space-y-3 border-t border-border pt-3">
            {loadingComments ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.loading")}…
              </div>
            ) : (
              <div className="space-y-2">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 text-sm">
                    <Avatar className="h-6 w-6 text-[10px]">
                      <AvatarFallback>
                        {(comment.author?.name ?? "?").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{comment.author?.name}</span>{" "}
                      <span className="text-muted-foreground">{comment.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder={t("community.comments")}
                className="h-9"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={submitComment}
                disabled={postingComment || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
