"use client"
import type { Conversation, Message, User } from "@/lib/db"
import { cn } from "@/lib/utils"
import { MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type ConversationItemProps = {
  conversation: Conversation & {
    lastMessage?: Message
    participants: User[]
  }
  currentUserId: number
}

function ConversationItem({ conversation, currentUserId }: ConversationItemProps) {
  const pathname = usePathname()
  const isActive = pathname === `/chat/${conversation.id}`

  // Determine conversation name
  const displayName =
    conversation.name ||
    (conversation.is_group
      ? `Group (${conversation.participants.length})`
      : conversation.participants
          .filter((p) => p.id !== currentUserId)
          .map((p) => p.display_name || p.username)
          .join(", "))

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className={cn(
        "block p-3 rounded-lg mb-2 transition-all duration-300",
        "bg-gradient-to-r from-gray-900 to-gray-800",
        "hover:from-gray-800 hover:to-gray-700",
        "border border-transparent",
        isActive
          ? "border-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.5)]"
          : "hover:border-[#00ffff] hover:shadow-[0_0_5px_rgba(0,255,255,0.3)]",
      )}
    >
      <div className="flex items-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mr-3",
            "bg-gradient-to-br from-purple-600 to-blue-500",
            "text-white font-bold",
          )}
        >
          {conversation.is_group ? (
            <Users className="w-5 h-5 text-white" />
          ) : (
            <MessageSquare className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className={cn("font-medium truncate", isActive ? "text-[#ff00ff]" : "text-white")}>{displayName}</h3>
            {conversation.lastMessage && (
              <span className="text-xs text-gray-400">
                {new Date(conversation.lastMessage.sent_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          {conversation.lastMessage && (
            <p className="text-sm text-gray-400 truncate">
              {conversation.lastMessage.sender_name}: {conversation.lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

type ConversationListProps = {
  conversations: (Conversation & {
    lastMessage?: Message
    participants: User[]
  })[]
  currentUserId: number
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  return (
    <div className="space-y-1 py-2">
      {conversations.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
