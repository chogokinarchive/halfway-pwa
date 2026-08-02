"use client";

import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim() || profile.name,
        country: country.trim(),
        bio: bio.trim(),
        native_language: nativeLanguage.trim() || profile.native_language,
        learning_language: learningLanguage.trim() || profile.learning_language,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (!error) {
      setOpen(false);
      onSaved();
    }
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

        <div className="space-y-3">
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
        </div>

        <Button className="mt-4 w-full gap-2" onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("profile.editProfile")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
