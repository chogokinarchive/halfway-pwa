"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { VoiceRecorderButton } from "@/components/communication/VoiceRecorderButton";
import { ExchangeSessionsDialog } from "@/components/communication/ExchangeSessionsDialog";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { MessageRow } from "@/types/database";

export default function ChatThreadPage() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;

  const [otherUserName, setOtherUserName] = useState<string>("");
  const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshMessages = async () => {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(msgs ?? []);
  };

  useEffect(() => {
    if (!user || !conversationId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("user_a, user_b")
        .eq("id", conversationId)
        .single();

      if (conv) {
        const otherId = conv.user_a === user.id ? conv.user_b : conv.user_a;
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", otherId)
          .single();
        setOtherUserName(profile?.name ?? "?");
        setOtherUserAvatar(profile?.avatar_url ?? null);
      }

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages(msgs ?? []);

      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => {
              const incoming = payload.new as MessageRow;
              if (prev?.some((m) => m.id === incoming.id)) return prev;
              return [...(prev ?? []), incoming];
            });
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || sending || !user) return;
    setSending(true);
    setDraft("");

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select("*")
      .single();

    if (!error && data) {
      setMessages((prev) => {
        if (prev?.some((m) => m.id === data.id)) return prev;
        return [...(prev ?? []), data as MessageRow];
      });
    }
    setSending(false);
  };

  if (!user || messages === null) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] flex-col md:h-[calc(100vh-6.5rem)]">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/communication")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-9 w-9">
          {otherUserAvatar && <AvatarImage src={otherUserAvatar} alt="" />}
          <AvatarFallback>{otherUserName.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="flex-1 font-medium">{otherUserName}</p>
        <ExchangeSessionsDialog conversationId={conversationId} currentUserId={user.id} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            {t("communication.privateChatDesc")}
          </p>
        )}
        {messages.map((message) => {
          const isMine = message.sender_id === user.id;
          return (
            <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                  isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {message.media_type === "audio" && message.media_url ? (
                  <audio src={message.media_url} controls className="h-9 max-w-[220px]" />
                ) : (
                  <p>{message.content}</p>
                )}
                <p
                  className={cn(
                    "mt-1 text-[10px] opacity-70",
                    isMine ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {formatDateTime(message.created_at, locale)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={t("communication.privateChat")}
        />
        <VoiceRecorderButton
          conversationId={conversationId}
          senderId={user.id}
          onSent={refreshMessages}
        />
        <Button size="icon" onClick={sendMessage} disabled={sending || !draft.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
