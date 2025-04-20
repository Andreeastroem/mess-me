"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { findUsersByDisplayName } from "@/app/actions/user-actions";
import type { User } from "@/lib/db";
import { createConversation } from "@/app/actions/create-conversation";
import { useRouter } from "next/navigation";
import Image from "next/image";

type NewConversationPopupProps = {
  currentUserId: number;
  onClose: () => void;
};

export function NewConversationPopup({
  currentUserId,
  onClose,
}: NewConversationPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length > 0) {
        const results = await findUsersByDisplayName(searchQuery);
        setUsers(results.filter((user) => user.id !== currentUserId));
        setIsOpen(true);
      } else {
        setUsers([]);
        setIsOpen(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUserId]);

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, users.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && users[selectedIndex]) {
      e.preventDefault();
      handleSelectUser(users[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelectUser = async (user: User) => {
    try {
      const conversation = await createConversation(currentUserId, user.id);
      if (conversation) {
        router.push(`/chat/${conversation.id}`);
        onClose();
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-4 w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a user..."
            className="w-full bg-gray-800 text-white py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
          />
        </div>
        {isOpen && users.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto">
            {users.map((user, index) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full p-2 text-left rounded-lg hover:bg-gray-800 ${
                  index === selectedIndex ? "bg-gray-800" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-white">
                      {user.display_name || user.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      @{user.username}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
