import { getUserSession } from "@/app/actions/auth-actions";
import { getConversationDetails } from "@/app/actions/message-actions";
import { ConversationView } from "@/components/conversation-view";
import { redirect } from "next/navigation";

export default async function ConversationPage(props: {
  params: Promise<{ conversationId: string }>;
}) {
  const params = await props.params;
  const user = await getUserSession();

  if (!user) {
    redirect("/login");
  }

  const conversationId = Number.parseInt(params.conversationId);

  if (isNaN(conversationId)) {
    redirect("/chat");
  }

  const result = await getConversationDetails(conversationId);

  if (!result.success) {
    redirect("/chat");
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <div className="flex-1">
        <ConversationView
          conversationId={conversationId}
          userId={user.id}
          initialConversation={result.conversation}
        />
      </div>
    </div>
  );
}
