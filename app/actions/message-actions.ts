"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Conversation, Message, User } from "@/lib/db";
const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
});

export async function sendMessage(
  conversationId: number,
  userId: number,
  formData: FormData
) {
  try {
    const content = formData.get("content") as string;

    // Validate the input
    const result = messageSchema.safeParse({ content });

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    // Check if user is a participant in the conversation
    const participants = (await sql`
      SELECT id FROM participants 
      WHERE conversation_id = ${conversationId} 
      AND user_id = ${userId} 
      AND left_at IS NULL
    `) as User[];

    if (participants.length === 0) {
      return {
        success: false,
        errors: {
          _form: ["You are not a participant in this conversation"],
        },
      };
    }

    // Insert the message
    const messages = (await sql`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (${conversationId}, ${userId}, ${content})
      RETURNING id, conversation_id, sender_id, content, sent_at
    `) as Message[];

    // Update the conversation's updated_at timestamp
    await sql`
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ${conversationId}
    `;

    revalidatePath(`/chat/${conversationId}`);

    return {
      success: true,
      message: messages[0],
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      errors: {
        _form: ["An error occurred while sending your message"],
      },
    };
  }
}

export async function getMessagesForConversation(
  conversationId: number,
  limit = 50,
  offset = 0
) {
  try {
    const messages = (await sql`
      SELECT m.*, u.username, u.display_name, u.avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversationId} AND m.is_deleted = false
      ORDER BY m.sent_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as Message[];

    return {
      success: true,
      messages: messages.reverse(), // Reverse to get chronological order
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      success: false,
      error: "Failed to fetch messages",
    };
  }
}

export async function getConversationDetails(conversationId: number): Promise<
  | {
      success: true;
      conversation: Conversation & {
        participants: User[];
      };
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    const conversations = (await sql`
      SELECT c.*, COUNT(p.id) as participant_count
      FROM conversations c
      JOIN participants p ON c.id = p.conversation_id
      WHERE c.id = ${conversationId}
      GROUP BY c.id
    `) as Conversation[];

    if (conversations.length === 0) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    const participants = (await sql`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.status
      FROM users u
      JOIN participants p ON u.id = p.user_id
      WHERE p.conversation_id = ${conversationId} AND p.left_at IS NULL
    `) as User[];

    return {
      success: true,
      conversation: {
        ...conversations[0],
        participants,
      },
    };
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return {
      success: false,
      error: "Failed to fetch conversation details",
    };
  }
}
