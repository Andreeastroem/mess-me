import { getUserSession } from "../actions/auth-actions";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ChatPage() {
  const user = await getUserSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 p-4">
      <div className="text-center max-w-md">
        <div
          className={cn(
            "w-20 h-20 rounded-full mx-auto mb-6",
            "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
            "flex items-center justify-center",
            "shadow-[0_0_30px_rgba(255,0,255,0.3)]"
          )}
        >
          <MessageSquare className="w-10 h-10 text-white" />
        </div>

        <h2
          className={cn(
            "text-2xl font-bold mb-4",
            "bg-clip-text text-transparent",
            "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
            "drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]"
          )}
        >
          Welcome to Neon Chat
        </h2>

        <p className="text-gray-400 mb-6">
          Select a conversation from the sidebar or create a new one to start
          chatting
        </p>

        <div
          className={cn(
            "p-4 rounded-lg",
            "bg-gray-900/50 border border-gray-800",
            "text-sm text-gray-400"
          )}
        >
          <p className="mb-2">
            <span className="text-[#ff00ff] font-medium">Tip:</span> Use the
            &quot;New Conversation&quot; button to start chatting with other
            users.
          </p>
        </div>
      </div>
    </div>
  );
}
