"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { cn } from "@/lib/utils"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { useMessageStream } from "@/hooks/use-message-stream"
import { SSEFallback } from "./sse-fallback"

type ConversationViewProps = {
  conversationId: number
  userId: number
  initialConversation: {
    id: number
    name: string | null
    is_group: boolean
    participants: {
      id: number
      username: string
      display_name: string | null
      avatar_url: string | null
      status: string
    }[]
  }
}

export function ConversationView({ conversationId, userId, initialConversation }: ConversationViewProps) {
  const [retryKey, setRetryKey] = useState(0)
  const { messages, isLoading, error } = useMessageStream(conversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleRetry = useCallback(() => {
    setRetryKey((prev) => prev + 1)
  }, [])

  // Get conversation name
  const conversationName =
    initialConversation.name ||
    (initialConversation.is_group
      ? `Group (${initialConversation.participants.length})`
      : initialConversation.participants
          .filter((p) => p.id !== userId)
          .map((p) => p.display_name || p.username)
          .join(", "))

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-screen">
      {/* Conversation Header */}
      <div className={cn("p-4 flex items-center", "border-b border-gray-800", "bg-gray-900")}>
        <Link
          href="/chat"
          className={cn(
            "md:hidden flex items-center text-gray-400 hover:text-white mr-3",
            "transition-colors duration-200",
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mr-3",
            "bg-gradient-to-br from-purple-600 to-blue-500",
            "text-white font-bold",
          )}
        >
          {initialConversation.is_group ? (
            <Users className="w-5 h-5 text-white" />
          ) : (
            initialConversation.participants
              .filter((p) => p.id !== userId)
              .map((p) =>
                p.avatar_url ? (
                  <img
                    key={p.id}
                    src={p.avatar_url || "/placeholder.svg"}
                    alt={p.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  (p.display_name || p.username).charAt(0).toUpperCase()
                ),
              )[0]
          )}
        </div>

        <div>
          <h2 className="font-medium text-white">{conversationName}</h2>
          <div className="text-xs text-gray-400">{initialConversation.participants.length} participants</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-950">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-[#00ffff]">Loading messages...</div>
          </div>
        ) : error ? (
          <SSEFallback onRetry={handleRetry} />
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Be the first to send a message!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isCurrentUser={message.sender_id === userId} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput conversationId={conversationId} userId={userId} />
    </div>
  )
}
