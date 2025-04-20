import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { getUserSession } from "../actions/auth-actions";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-gray-950">
      <Sidebar user={user} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
