"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsGrid } from "@/components/profile/StatsGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();

  const [stats, setStats] = useState<{
    streak: number;
    words: number;
    exchanges: number;
    friends: number;
  } | null>(null);

  const loadStats = useCallback(async () => {
    if (!user) return;

    const [progressRes, connectionsRes, messagesRes] = await Promise.all([
      supabase
        .from("learning_progress")
        .select("words_learned, streak")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("connections")
        .select("id", { count: "exact", head: true })
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", user.id),
    ]);

    setStats({
      words: progressRes.data?.words_learned ?? 0,
      streak: progressRes.data?.streak ?? 0,
      friends: connectionsRes.count ?? 0,
      exchanges: messagesRes.count ?? 0,
    });
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (!user || !profile) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        onSaved={async () => {
          await refreshProfile();
        }}
      />

      {stats ? (
        <StatsGrid stats={stats} />
      ) : (
        <LoadingScreen />
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">{t("profile.progressTitle")}</h2>
        <EmptyState
          icon={TrendingUp}
          title={t("profile.progressComingSoon")}
          className="py-12"
        />
      </section>
    </div>
  );
}
