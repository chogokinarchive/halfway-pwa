"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const { t } = useTranslation();
  const { session, loading, signInWithPassword, signUpWithPassword } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    if (mode === "signIn") {
      const { error: signInError } = await signInWithPassword(email, password);
      if (signInError) setError(signInError);
    } else {
      const { error: signUpError } = await signUpWithPassword(email, password, name);
      if (signUpError) {
        setError(signUpError);
      } else {
        setSuccessMessage(t("auth.signUpSuccess"));
        setMode("signIn");
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-semibold tracking-tight">{t("app.name")}</span>
        </div>
        <LanguageSelector />
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight">
                {t("auth.welcomeTitle")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("auth.welcomeSubtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signIn");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={cn(
                  "rounded-lg py-2 text-sm font-medium transition-colors",
                  mode === "signIn" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                {t("auth.signIn")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signUp");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={cn(
                  "rounded-lg py-2 text-sm font-medium transition-colors",
                  mode === "signUp" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                {t("auth.signUp")}
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              {mode === "signUp" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="name">
                    {t("auth.name")}
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("auth.namePlaceholder")}
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">
                  {t("auth.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="password">
                  {t("auth.password")}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  minLength={6}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {successMessage && (
                <p className="text-sm text-secondary-foreground">{successMessage}</p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signIn" ? t("auth.signInAction") : t("auth.signUpAction")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
