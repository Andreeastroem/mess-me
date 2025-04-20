"use server";

import { sql } from "@/lib/db";

export async function createConversation(
  userId: number,
  participantId: number
) {
  try {
    const conversation =
      await sql`INSERT INTO conversations (name, created_by) VALUES ('New conversation', ${userId})`;

    await addToConversation(conversation.id, userId);
    await addToConversation(conversation.id, participantId);

    return conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
}

export async function addToConversation(
  conversationId: number,
  userId: number
) {
  try {
    const conversation =
      await sql`INSERT INTO participants (conversation_id, user_id) VALUES (${conversationId}, ${userId})`;
    return conversation;
  } catch (error) {
    console.error("Error adding to conversation:", error);
    return null;
  }
}
