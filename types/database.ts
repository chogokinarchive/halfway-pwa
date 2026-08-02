export interface ProfileRow {
  id: string;
  name: string;
  country: string;
  bio: string;
  native_language: string;
  learning_language: string;
  push_notifications: boolean;
  email_notifications: boolean;
  created_at: string;
}

export interface LearningProgressRow {
  user_id: string;
  words_learned: number;
  streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

export interface VocabularyProgressRow {
  user_id: string;
  vocabulary_id: string;
  saved: boolean;
  learned: boolean;
  created_at: string;
}

export interface PostRow {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface PostWithAuthor extends PostRow {
  author: Pick<ProfileRow, "id" | "name" | "country"> | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

export interface PostCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface PostCommentWithAuthor extends PostCommentRow {
  author: Pick<ProfileRow, "id" | "name"> | null;
}

export interface ConnectionRow {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
