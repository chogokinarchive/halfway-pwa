"use client";

import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { useTranslation } from "@/hooks/useTranslation";
import type { ProfileRow } from "@/types/database";

export function ProfileHeader({
  profile,
  onSaved,
}: {
  profile: ProfileRow;
  onSaved: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center sm:flex-row sm:text-left">
      <Avatar className="h-20 w-20 text-xl">
        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{profile.name}</h1>
          {profile.country && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {profile.country}
            </span>
          )}
        </div>
        {profile.bio && (
          <p className="mx-auto max-w-md text-sm text-muted-foreground sm:mx-0">{profile.bio}</p>
        )}
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <Badge variant="muted">
            {t("profile.native")}: {profile.native_language}
          </Badge>
          <Badge variant="outline">
            {t("profile.learning")}: {profile.learning_language}
          </Badge>
        </div>
      </div>

      <EditProfileDialog profile={profile} onSaved={onSaved} />
    </div>
  );
}
