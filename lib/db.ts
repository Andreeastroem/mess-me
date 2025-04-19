import { neon } from "@neondatabase/serverless";

// Create a SQL client with the pooled connection
export const sql = neon(process.env.DATABASE_URL!);

// Types based on our database schema
export type User = {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  status: string;
  bio: string | null;
};

export type Conversation = {
  id: number;
  name: string | null;
  is_group: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
};

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  sent_at: Date;
  sender_name?: string;
};

export type Participant = {
  id: number;
  user_id: number;
  conversation_id: number;
  joined_at: Date;
  is_admin: boolean;
};

export type CustomEmoji = {
  id: number;
  name: string;
  image_url: string;
  created_by: number;
};
