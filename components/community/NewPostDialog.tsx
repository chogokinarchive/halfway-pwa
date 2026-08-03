"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, PlusCircle, X } from "lucide-react";
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

const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

type MediaKind = "image" | "video";

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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setContent("");
    setMediaFile(null);
    setMediaKind(null);
    setMediaPreview(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const kind: MediaKind | null = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : null;

    if (!kind) {
      setError(t("community.unsupportedMedia"));
      return;
    }

    const maxMb = kind === "image" ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
    if (file.size > maxMb * 1024 * 1024) {
      setError(t("community.mediaTooLarge").replace("{max}", String(maxMb)));
      return;
    }

    setError(null);
    setMediaFile(file);
    setMediaKind(kind);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaKind(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);

    let mediaUrl: string | null = null;

    if (mediaFile && mediaKind) {
      const ext = mediaFile.name.split(".").pop() ?? "bin";
      const path = `${authorId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, mediaFile);

      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(path);
      mediaUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      author_id: authorId,
      content: trimmed,
      media_url: mediaUrl,
      media_type: mediaUrl ? mediaKind : null,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    resetForm();
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
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

        {mediaPreview ? (
          <div className="relative mt-3 overflow-hidden rounded-xl border border-border bg-muted">
            {mediaKind === "video" ? (
              <video src={mediaPreview} controls className="max-h-64 w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaPreview} alt="" className="max-h-64 w-full object-contain" />
            )}
            <button
              onClick={removeMedia}
              className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow"
              aria-label="Remove media"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <ImagePlus className="h-4 w-4" />
            {t("community.addMedia")}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <Button className="mt-3 w-full gap-2" onClick={submit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("community.newPost")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
