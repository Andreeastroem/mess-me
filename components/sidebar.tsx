"use client";

import { useState, useCallback } from "react";
import { Search, Plus, LogOut, Menu, X } from "lucide-react";
import { ConversationList } from "./conversation-list";
import { logout } from "@/app/actions/auth-actions";
import type { User } from "@/lib/db";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useConversationStream } from "@/hooks/use-conversation-stream";
import { SSEFallback } from "./sse-fallback";
import Image from "next/image";
import { NewConversationPopup } from "./new-conversation-popup";

type SidebarProps = {
  user: User;
};

export function Sidebar({ user }: SidebarProps) {
  const [retryKey, setRetryKey] = useState(0);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // State for collapsed sidebar
  const { conversations, isLoading, error } = useConversationStream(retryKey);

  const handleRetry = useCallback(() => {
    setRetryKey((prev) => prev + 1);
  }, []);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <div
      className={cn(
        "h-full flex flex-col justify-between",
        isCollapsed ? "w-16" : "w-80",
        "bg-gradient-to-b from-gray-950 to-gray-900",
        "border-r border-gray-800 transition-all duration-300"
      )}
    >
      <div className={"flex flex-col"}>
        {/* Header */}
        <div
          className={cn(
            "p-4 flex items-center justify-between",
            "border-b border-gray-800"
          )}
        >
          {!isCollapsed && (
            <Link
              href="/chat"
              className={cn(
                "text-xl font-bold",
                "bg-clip-text text-transparent",
                "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
                "drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]"
              )}
            >
              {"Mess me"}
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "bg-gray-800 hover:bg-gray-700 text-white"
            )}
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div
            className={cn("p-4 flex items-center", "border-b border-gray-800")}
          >
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
        )}

        {/* Search */}
        {!isCollapsed && (
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
        )}

        {/* New Conversation Button */}
        {!isCollapsed && (
          <button
            onClick={() => setShowNewConversation(true)}
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
        )}

        {showNewConversation && (
          <NewConversationPopup
            currentUserId={user.id}
            onClose={() => setShowNewConversation(false)}
          />
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4">
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-4 mt-4">
              <button className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full text-white">
                <Search className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full text-white">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : isLoading ? (
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
      <div className="flex p-4">
        <button
          onClick={logout}
          className="ml-auto p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
