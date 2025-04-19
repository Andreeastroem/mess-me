"use server";

import { sql } from "@/lib/db";
import type { Conversation, Message, User } from "@/lib/db";

export async function getConversations(
  userId: number
): Promise<(Conversation & { lastMessage?: Message; participants: User[] })[]> {
  try {
    // Get all conversations the user is part of
    const conversations = (await sql`
    SELECT c.*, COUNT(p.id) as participant_count
    FROM conversations c
    JOIN participants p ON c.id = p.conversation_id
    WHERE c.id IN (
      SELECT conversation_id 
      FROM participants 
      WHERE user_id = ${userId} AND left_at IS NULL
    )
    GROUP BY c.id
    ORDER BY c.updated_at DESC
  `) as Conversation[];

    // For each conversation, get the participants and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Get participants
        const participants = (await sql`
        SELECT u.id, u.username, u.display_name, u.avatar_url, u.status
        FROM users u
        JOIN participants p ON u.id = p.user_id
        WHERE p.conversation_id = ${conversation.id} AND p.left_at IS NULL
        LIMIT 10
      `) as User[];

        // Get last message
        const lastMessages = (await sql`
        SELECT m.*, u.username as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ${conversation.id} AND m.is_deleted = false
        ORDER BY m.sent_at DESC
        LIMIT 1
      `) as Message[];

        const lastMessage =
          lastMessages.length > 0 ? lastMessages[0] : undefined;

        return {
          ...conversation,
          participants,
          lastMessage,
        };
      })
    );

    return conversationsWithDetails;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

export async function getMessages(
  conversationId: number,
  limit = 50,
  offset = 0
): Promise<Message[]> {
  try {
    const messages = (await sql`
    SELECT m.*, u.username as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ${conversationId} AND m.is_deleted = false
    ORDER BY m.sent_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as Message[];

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}
