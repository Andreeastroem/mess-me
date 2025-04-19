import { sql } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
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

    // Get conversation ID from params
    const conversationId = Number.parseInt(params.conversationId);
    if (isNaN(conversationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid conversation ID" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if user is a participant in the conversation
    try {
      const participants = await sql`
        SELECT id FROM participants 
        WHERE conversation_id = ${conversationId} 
        AND user_id = ${Number.parseInt(userId)} 
        AND left_at IS NULL
      `;

      if (participants.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: "Not a participant in this conversation" }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error checking participant:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to verify participant" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial messages
          const initialMessages = await sql`
            SELECT m.*, u.username, u.display_name, u.avatar_url
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ${conversationId} AND m.is_deleted = false
            ORDER BY m.sent_at ASC
          `;

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "initial",
                messages: initialMessages,
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

          // Set up a polling mechanism for new messages
          let lastMessageId =
            initialMessages.length > 0
              ? Math.max(...initialMessages.map((m) => m.id))
              : 0;

          const checkNewMessages = async () => {
            try {
              const newMessages = await sql`
                SELECT m.*, u.username, u.display_name, u.avatar_url
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ${conversationId} 
                AND m.is_deleted = false
                AND m.id > ${lastMessageId}
                ORDER BY m.sent_at ASC
              `;

              if (newMessages.length > 0) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "messages",
                      messages: newMessages,
                    })}\n\n`
                  )
                );
                lastMessageId = Math.max(...newMessages.map((m) => m.id));
              }
            } catch (error) {
              console.error("Error checking for new messages:", error);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    message: "Failed to fetch new messages",
                  })}\n\n`
                )
              );
            }
          };

          const messagePoller = setInterval(checkNewMessages, 2000); // Check every 2 seconds

          // Clean up on close
          request.signal.addEventListener("abort", () => {
            clearInterval(heartbeat);
            clearInterval(messagePoller);
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
