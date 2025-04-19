"use client";

import { useState, useCallback } from "react";
import { Search, Plus, Settings, LogOut } from "lucide-react";
import { ConversationList } from "./conversation-list";
import { logout } from "@/app/actions/auth-actions";
import type { User } from "@/lib/db";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useConversationStream } from "@/hooks/use-conversation-stream";
import { SSEFallback } from "./sse-fallback";
import Image from "next/image";

type SidebarProps = {
  user: User;
};

export function Sidebar({ user }: SidebarProps) {
  const [retryKey, setRetryKey] = useState(0);
  const { conversations, isLoading, error } = useConversationStream();

  const handleRetry = useCallback(() => {
    setRetryKey((prev) => prev + 1);
  }, []);

  return (
    <div
      className={cn(
        "h-screen w-80 flex flex-col",
        "bg-gradient-to-b from-gray-950 to-gray-900",
        "border-r border-gray-800"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 flex items-center justify-between",
          "border-b border-gray-800"
        )}
      >
        <Link
          href="/chat"
          className={cn(
            "text-xl font-bold",
            "bg-clip-text text-transparent",
            "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
            "drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]"
          )}
        >
          Neon Chat
        </Link>
        <div className="flex space-x-2">
          <Link
            href="/account"
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "bg-gray-800 hover:bg-gray-700",
              "text-[#00ffff] hover:text-white",
              "transition-all duration-300",
              "hover:shadow-[0_0_10px_rgba(0,255,255,0.5)]"
            )}
          >
            <Settings className="w-4 h-4" />
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-gray-800 hover:bg-gray-700",
                "text-[#ff00ff] hover:text-white",
                "transition-all duration-300",
                "hover:shadow-[0_0_10px_rgba(255,0,255,0.5)]"
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* User Info */}
      <div className={cn("p-4 flex items-center", "border-b border-gray-800")}>
        <Link
          href="/account"
          className="flex items-center w-full hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-3",
              "bg-gradient-to-br from-purple-600 to-blue-500",
              "text-white font-bold"
            )}
          >
            {user.avatar_url ? (
              <Image
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-medium text-white">
              {user.display_name || user.username}
            </div>
            <div className="text-xs text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Online
            </div>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="p-4">
        <div
          className={cn(
            "relative",
            "bg-gray-800 rounded-lg",
            "focus-within:ring-2 focus-within:ring-[#00ffff] focus-within:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
          )}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            className={cn(
              "w-full bg-transparent py-2 pl-10 pr-4",
              "text-white placeholder-gray-400",
              "focus:outline-none rounded-lg"
            )}
          />
        </div>
      </div>

      {/* New Conversation Button */}
      <button
        className={cn(
          "mx-4 mb-4 py-2 px-4 rounded-lg",
          "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
          "text-white font-medium",
          "flex items-center justify-center",
          "hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]",
          "transition-all duration-300"
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Conversation
      </button>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-[#00ffff]">Loading...</div>
          </div>
        ) : error ? (
          <SSEFallback onRetry={handleRetry} />
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No conversations yet
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
          />
        )}
      </div>
    </div>
  );
}
