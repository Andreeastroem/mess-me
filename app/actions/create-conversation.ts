"use server";

import { Conversation, sql } from "@/lib/db";

export async function createConversation(
  userId: number,
  participantId: number
) {
  try {
    const conversation =
      (await sql`INSERT INTO conversations (name, created_by) VALUES ('New conversation', ${userId})`) as Conversation[];

    if (conversation.length === 0) {
      console.error("Failed to create conversation");
      return null;
    }
    const conversationId = conversation[0].id;
    // Add the user and participant to the conversation

    await addToConversation(conversationId, userId);
    await addToConversation(conversationId, participantId);

    return conversation[0];
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
