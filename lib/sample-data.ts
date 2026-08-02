import type { ExpressionItem, VocabularyItem } from "@/types";

/**
 * Curated learning content (vocabulary + expressions). This is static app
 * content, not user data — user interactions with these items (saved /
 * learned) are persisted per-user in Supabase (see vocabulary_progress).
 */

export const VOCABULARY: VocabularyItem[] = [
  { id: "v1", italian: "Ciao", japanese: "こんにちは", reading: "konnichiwa", english: "Hello", category: "Greetings" },
  { id: "v2", italian: "Grazie", japanese: "ありがとう", reading: "arigatou", english: "Thank you", category: "Greetings" },
  { id: "v3", italian: "Amicizia", japanese: "友情", reading: "yuujou", english: "Friendship", category: "Relationships" },
  { id: "v4", italian: "Viaggio", japanese: "旅行", reading: "ryokou", english: "Trip / Journey", category: "Travel" },
  { id: "v5", italian: "Cultura", japanese: "文化", reading: "bunka", english: "Culture", category: "Society" },
  { id: "v6", italian: "Cibo", japanese: "食べ物", reading: "tabemono", english: "Food", category: "Daily life" },
  { id: "v7", italian: "Famiglia", japanese: "家族", reading: "kazoku", english: "Family", category: "Relationships" },
  { id: "v8", italian: "Scuola", japanese: "学校", reading: "gakkou", english: "School", category: "Daily life" },
];

export const EXPRESSIONS: ExpressionItem[] = [
  {
    id: "e1",
    italian: "Piacere di conoscerti",
    japanese: "はじめまして",
    reading: "hajimemashite",
    english: "Nice to meet you",
    context: "First meeting",
  },
  {
    id: "e2",
    italian: "Come stai?",
    japanese: "元気ですか？",
    reading: "genki desu ka",
    english: "How are you?",
    context: "Everyday conversation",
  },
  {
    id: "e3",
    italian: "A presto!",
    japanese: "またね",
    reading: "mata ne",
    english: "See you soon",
    context: "Saying goodbye",
  },
  {
    id: "e4",
    italian: "Buon appetito",
    japanese: "いただきます",
    reading: "itadakimasu",
    english: "Enjoy your meal",
    context: "Before eating",
  },
];
