"use client"

import { useState, useEffect, useRef } from "react"
import type { Conversation, Message, User } from "@/lib/db"

type ConversationWithDetails = Conversation & {
  lastMessage?: Message
  participants: User[]
}

export function useConversationStream() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Function to connect to the SSE stream
    const connectToStream = () => {
      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      try {
        // Create EventSource connection
        const eventSource = new EventSource("/api/conversations/stream")
        eventSourceRef.current = eventSource

        // Handle connection open
        eventSource.onopen = () => {
          console.log("Conversations SSE connection opened")
          setError(null)
        }

        // Handle messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.type === "initial") {
              setConversations(data.conversations)
              setIsLoading(false)
            } else if (data.type === "conversations") {
              setConversations(data.conversations)
            } else if (data.type === "error") {
              console.error("Server reported error:", data.message)
              setError(data.message || "Server error")
            }
            // Ignore heartbeat messages
          } catch (e) {
            console.error("Error parsing SSE message:", e)
          }
        }

        // Handle errors
        eventSource.onerror = (e) => {
          console.error("SSE error:", e)

          // Close the current connection
          eventSource.close()
          eventSourceRef.current = null

          // Set error state
          setError("Connection error. Reconnecting...")

          // Try to reconnect after a delay
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect to conversation stream...")
            connectToStream()
          }, 5000)
        }
      } catch (e) {
        console.error("Error setting up SSE:", e)
        setError("Failed to connect to conversation stream")
        setIsLoading(false)

        // Try to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect to conversation stream...")
          connectToStream()
        }, 5000)
      }
    }

    // Initial connection
    connectToStream()

    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        console.log("Closing conversations SSE connection")
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [])

  return { conversations, isLoading, error }
}
