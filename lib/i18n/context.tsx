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
import en from "@/locales/en.json";
import it from "@/locales/it.json";
import ja from "@/locales/ja.json";
import type { SupportedLocale } from "@/types";

const dictionaries: Record<SupportedLocale, Record<string, unknown>> = {
  en,
  it,
  ja,
};

export const SUPPORTED_LOCALES: SupportedLocale[] = ["it", "en", "ja"];
const DEFAULT_LOCALE: SupportedLocale = "en";
const STORAGE_KEY = "halfway-locale";

function getFromPath(obj: unknown, path: string): string | undefined {
  const result = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      obj
    );
  return typeof result === "string" ? result : undefined;
}

function getRawFromPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      obj
    );
}

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
  tRaw: (key: string) => unknown;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start from the deterministic default so server and client
  // produce identical markup on first paint. The persisted preference
  // (if any) is applied after mount, which triggers a normal client
  // re-render rather than a hydration mismatch.
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
      setLocaleState(stored as SupportedLocale);
    }
  }, []);

  const setLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string) => {
      return (
        getFromPath(dictionaries[locale], key) ??
        getFromPath(dictionaries[DEFAULT_LOCALE], key) ??
        key
      );
    },
    [locale]
  );

  const tRaw = useCallback(
    (key: string): unknown => {
      return (
        getRawFromPath(dictionaries[locale], key) ??
        getRawFromPath(dictionaries[DEFAULT_LOCALE], key)
      );
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, tRaw }),
    [locale, setLocale, t, tRaw]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
