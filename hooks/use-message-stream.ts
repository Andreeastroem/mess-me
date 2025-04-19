"use client";

import { useEffect, useState, useRef } from "react";

type Message = {
  id: number;
  content: string;
  sent_at: string;
  sender_id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  [key: string]: unknown;
};

export function useMessageStream(conversationId: number, retryKey: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to connect to the SSE stream
    const connectToStream = () => {
      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      try {
        // Create EventSource connection
        const eventSource = new EventSource(
          `/api/messages/${conversationId}/stream`
        );
        eventSourceRef.current = eventSource;

        // Handle connection open
        eventSource.onopen = () => {
          console.log("Messages SSE connection opened");
          setError(null);
        };

        // Handle messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "initial") {
              setMessages(data.messages);
              setIsLoading(false);
            } else if (data.type === "messages") {
              setMessages((prev) => [...prev, ...data.messages]);
            } else if (data.type === "error") {
              console.error("Server reported error:", data.message);
              setError(data.message || "Server error");
            }
            // Ignore heartbeat messages
          } catch (e) {
            console.error("Error parsing SSE message:", e);
          }
        };

        // Handle errors
        eventSource.onerror = (e) => {
          console.error("SSE error:", e);

          // Close the current connection
          eventSource.close();
          eventSourceRef.current = null;

          // Set error state
          setError("Connection error. Reconnecting...");

          // Try to reconnect after a delay
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect to message stream...");
            connectToStream();
          }, 5000);
        };
      } catch (e) {
        console.error("Error setting up SSE:", e);
        setError("Failed to connect to message stream");
        setIsLoading(false);

        // Try to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect to message stream...");
          connectToStream();
        }, 5000);
      }
    };

    // Initial connection
    if (retryKey < 5) {
      connectToStream();
    } else {
      console.log("Closing message SSE connection");
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }

    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        console.log("Closing message SSE connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [conversationId, retryKey]);

  return { messages, isLoading, error };
}
