import { sql } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial conversations
          const initialConversations = await getConversationsWithDetails(
            Number.parseInt(userId)
          );

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "initial",
                conversations: initialConversations,
              })}\n\n`
            )
          );

          // Keep connection alive with heartbeat
          const heartbeat = setInterval(() => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "heartbeat" })}\n\n`
              )
            );
          }, 30000); // 30 seconds heartbeat

          // Set up a polling mechanism for conversation updates
          const checkConversations = async () => {
            try {
              const updatedConversations = await getConversationsWithDetails(
                Number.parseInt(userId)
              );
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "conversations",
                    conversations: updatedConversations,
                  })}\n\n`
                )
              );
            } catch (error) {
              console.error("Error checking for conversation updates:", error);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    message: "Failed to fetch conversations",
                  })}\n\n`
                )
              );
            }
          };

          const conversationPoller = setInterval(checkConversations, 5000); // Check every 5 seconds

          // Clean up on close
          request.signal.addEventListener("abort", () => {
            clearInterval(heartbeat);
            clearInterval(conversationPoller);
          });
        } catch (error) {
          console.error("Stream start error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "Stream initialization failed",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering for Nginx
      },
    });
  } catch (error) {
    console.error("SSE route error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function getConversationsWithDetails(userId: number) {
  try {
    // Get all conversations the user is part of
    const conversations = await sql`
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
    `;

    // For each conversation, get the participants and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          // Get participants
          const participants = await sql`
            SELECT u.id, u.username, u.display_name, u.avatar_url, u.status
            FROM users u
            JOIN participants p ON u.id = p.user_id
            WHERE p.conversation_id = ${conversation.id} AND p.left_at IS NULL
            LIMIT 10
          `;

          // Get last message
          const lastMessages = await sql`
            SELECT m.*, u.username as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ${conversation.id} AND m.is_deleted = false
            ORDER BY m.sent_at DESC
            LIMIT 1
          `;

          const lastMessage =
            lastMessages.length > 0 ? lastMessages[0] : undefined;

          return {
            ...conversation,
            participants,
            lastMessage,
          };
        } catch (error) {
          console.error(
            `Error fetching details for conversation ${conversation.id}:`,
            error
          );
          return {
            ...conversation,
            participants: [],
            lastMessage: undefined,
          };
        }
      })
    );

    return conversationsWithDetails;
  } catch (error) {
    console.error("Error in getConversationsWithDetails:", error);
    return [];
  }
}
