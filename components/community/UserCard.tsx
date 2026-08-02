"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";

export function UserCard({
  profile,
  currentUserId,
  alreadyConnected,
}: {
  profile: ProfileRow;
  currentUserId: string;
  alreadyConnected: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [connected, setConnected] = useState(alreadyConnected);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (connected || connecting) {
      if (connected) router.push("/communication");
      return;
    }
    setConnecting(true);

    const [userA, userB] =
      currentUserId < profile.id ? [currentUserId, profile.id] : [profile.id, currentUserId];

    await supabase.from("connections").upsert(
      { user_a: userA, user_b: userB },
      { onConflict: "user_a,user_b" }
    );
    await supabase.from("conversations").upsert(
      { user_a: userA, user_b: userB },
      { onConflict: "user_a,user_b" }
    );

    setConnected(true);
    setConnecting(false);
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile.name}</p>
            <div className="flex flex-wrap gap-1 pt-0.5">
              <Badge variant="muted" className="text-[10px]">
                {profile.native_language}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                → {profile.learning_language}
              </Badge>
            </div>
          </div>
        </div>
        {profile.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>
        )}
        <Button
          size="sm"
          variant={connected ? "secondary" : "outline"}
          className="w-full gap-1.5"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {connected && !connecting && <Check className="h-3.5 w-3.5" />}
          {connected ? t("communication.title") : t("community.connect")}
        </Button>
      </CardContent>
    </Card>
  );
}
