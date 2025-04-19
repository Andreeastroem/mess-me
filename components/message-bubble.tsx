import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

type MessageBubbleProps = {
  message: {
    id: number;
    content: string;
    sent_at: string;
    sender_id: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  isCurrentUser: boolean;
};

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formattedTime = formatDistanceToNow(new Date(message.sent_at), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        "flex mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-purple-600 to-blue-500",
              "text-white font-bold text-sm"
            )}
          >
            {message.avatar_url ? (
              <Image
                src={message.avatar_url || "/placeholder.svg"}
                alt={message.username}
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
            ) : (
              (message.display_name || message.username).charAt(0).toUpperCase()
            )}
          </div>
        </div>
      )}

      <div className={cn("max-w-[70%]")}>
        {!isCurrentUser && (
          <div className="text-xs text-gray-400 mb-1 ml-1">
            {message.display_name || message.username}
          </div>
        )}

        <div
          className={cn(
            "px-4 py-2 rounded-2xl",
            isCurrentUser
              ? "bg-gradient-to-r from-[#ff00ff] to-[#cc00cc] text-white shadow-[0_0_10px_rgba(255,0,255,0.3)]"
              : "bg-gray-800 text-white",
            "break-words"
          )}
        >
          {message.content}
        </div>

        <div
          className={cn(
            "text-xs text-gray-400 mt-1",
            isCurrentUser ? "text-right mr-1" : "ml-1"
          )}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
