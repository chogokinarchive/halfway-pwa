"use client";

import { useCallback, useEffect, useState } from "react";
import { Repeat, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDateTime } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ExchangeSessionRow } from "@/types/database";

export function ExchangeSessionsDialog({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<ExchangeSessionRow[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("exchange_sessions")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("scheduled_at", { ascending: true });
    setSessions(data ?? []);
  }, [conversationId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const propose = async () => {
    if (!scheduledAt || submitting) return;
    setSubmitting(true);

    await supabase.from("exchange_sessions").insert({
      conversation_id: conversationId,
      proposed_by: currentUserId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      note: note.trim() || null,
    });

    setScheduledAt("");
    setNote("");
    setSubmitting(false);
    load();
  };

  const respond = async (sessionId: string, status: "accepted" | "declined") => {
    await supabase.from("exchange_sessions").update({ status }).eq("id", sessionId);
    load();
  };

  const statusLabel = {
    proposed: t("communication.exchangeStatusProposed"),
    accepted: t("communication.exchangeStatusAccepted"),
    declined: t("communication.exchangeStatusDeclined"),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" aria-label={t("communication.exchangeTitle")}>
          <Repeat className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("communication.exchangeTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {sessions.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("communication.exchangeEmpty")}
            </p>
          )}
          {sessions.map((session) => (
            <div key={session.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{formatDateTime(session.scheduled_at, locale)}</p>
                <Badge
                  variant={
                    session.status === "accepted"
                      ? "default"
                      : session.status === "declined"
                        ? "outline"
                        : "muted"
                  }
                  className="text-[10px]"
                >
                  {statusLabel[session.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {session.proposed_by === currentUserId
                  ? t("communication.exchangeProposedByYou")
                  : t("communication.exchangeProposedByThem")}
              </p>
              {session.note && <p className="mt-1 text-muted-foreground">{session.note}</p>}

              {session.status === "proposed" && session.proposed_by !== currentUserId && (
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => respond(session.id, "accepted")}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {t("communication.exchangeAccept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => respond(session.id, "declined")}
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("communication.exchangeDecline")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium">{t("communication.exchangePropose")}</p>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("communication.exchangeDate")}</label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("communication.exchangeNote")}</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("communication.exchangeNotePlaceholder")}
            />
          </div>
          <Button
            className={cn("w-full gap-2")}
            onClick={propose}
            disabled={!scheduledAt || submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("communication.exchangeSubmit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
