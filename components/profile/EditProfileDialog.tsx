"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";

const MAX_AVATAR_SIZE_MB = 5;

export function EditProfileDialog({
  profile,
  onSaved,
}: {
  profile: ProfileRow;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [country, setCountry] = useState(profile.country);
  const [bio, setBio] = useState(profile.bio);
  const [nativeLanguage, setNativeLanguage] = useState(profile.native_language);
  const [learningLanguage, setLearningLanguage] = useState(profile.learning_language);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setError(t("profile.avatarTooLarge"));
      return;
    }

    setError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    let avatarUrl = profile.avatar_url;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() ?? "jpg";
      const path = `${profile.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: name.trim() || profile.name,
        country: country.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        native_language: nativeLanguage.trim() || profile.native_language,
        learning_language: learningLanguage.trim() || profile.learning_language,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          {t("profile.editProfile")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("profile.editProfile")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative"
            >
              <Avatar className="h-20 w-20 text-xl">
                {avatarPreview && <AvatarImage src={avatarPreview} alt="" />}
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("auth.name")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("profile.country")}</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("profile.native")}</label>
              <Input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("profile.learning")}</label>
              <Input
                value={learningLanguage}
                onChange={(e) => setLearningLanguage(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("profile.bio")}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button className="mt-4 w-full gap-2" onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("profile.editProfile")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
