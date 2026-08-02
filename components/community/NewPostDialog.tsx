"use client";

import { useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase/client";

export function NewPostDialog({
  authorId,
  onCreated,
}: {
  authorId: string;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);

    const { error } = await supabase.from("posts").insert({
      author_id: authorId,
      content: trimmed,
    });

    setSubmitting(false);
    if (!error) {
      setContent("");
      setOpen(false);
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {t("community.newPost")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("community.newPost")}</DialogTitle>
        </DialogHeader>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder={t("community.newPost")}
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button className="mt-3 w-full gap-2" onClick={submit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("community.newPost")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
