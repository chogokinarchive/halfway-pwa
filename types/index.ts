export type SupportedLocale = "it" | "en" | "ja";

export type ThemePreference = "light" | "dark" | "system";

export interface VocabularyItem {
  id: string;
  italian: string;
  japanese: string;
  reading?: string;
  english: string;
  category: string;
}

export interface ExpressionItem {
  id: string;
  italian: string;
  japanese: string;
  reading?: string;
  english: string;
  context: string;
}

export interface NavItem {
  href: string;
  labelKey: string;
  icon: string;
}
