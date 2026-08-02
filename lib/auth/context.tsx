"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, name: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      return { error: error?.message ?? null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user.id);
  }, [session, fetchProfile]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signInWithPassword, signUpWithPassword, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
