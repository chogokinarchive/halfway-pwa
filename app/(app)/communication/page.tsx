"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Languages, Mic, Repeat, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FeatureTile } from "@/components/communication/FeatureTile";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";
import { formatRelativeFromFixedPoint } from "@/lib/date-utils";

interface ConversationListItem {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string | null;
  last_message_at: string | null;
}

export default function CommunicationPage() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationListItem[] | null>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data: convRows } = await supabase
        .from("my_conversations")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (!convRows || convRows.length === 0) {
        setConversations([]);
        return;
      }

      const otherIds = convRows.map((c) => c.other_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", otherIds);

      const nameById = new Map(profiles?.map((p) => [p.id, p.name]));

      setConversations(
        convRows.map((c) => ({
          id: c.id,
          other_user_id: c.other_user_id,
          other_user_name: nameById.get(c.other_user_id) ?? "?",
          last_message: c.last_message,
          last_message_at: c.last_message_at,
        }))
      );
    })();
  }, [user]);

  const features = [
    {
      icon: Languages,
      title: t("communication.translation"),
      description: t("communication.translationDesc"),
    },
    {
      icon: Mic,
      title: t("communication.voiceMessages"),
      description: t("communication.voiceMessagesDesc"),
    },
    {
      icon: Repeat,
      title: t("communication.languageExchange"),
      description: t("communication.languageExchangeDesc"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("communication.title")}</h1>
        <p className="text-muted-foreground">{t("communication.subtitle")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("communication.privateChat")}
        </h2>

        {conversations === null && <LoadingScreen />}

        {conversations !== null && conversations.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title={t("communication.privateChat")}
            description={t("community.peopleToMeet")}
          />
        )}

        <div className="space-y-2">
          {conversations?.map((conv) => (
            <Link key={conv.id} href={`/communication/${conv.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar>
                    <AvatarFallback>{conv.other_user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{conv.other_user_name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {conv.last_message ?? "—"}
                    </p>
                  </div>
                  {conv.last_message_at && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeFromFixedPoint(
                        conv.last_message_at,
                        new Date().toISOString(),
                        locale
                      )}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("communication.title")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureTile key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
}
