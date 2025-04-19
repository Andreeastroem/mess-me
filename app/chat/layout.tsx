import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { getUserSession } from "../actions/auth-actions"
import { redirect } from "next/navigation"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
