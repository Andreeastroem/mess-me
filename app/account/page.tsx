import { getUserSession } from "../actions/auth-actions"
import { redirect } from "next/navigation"
import { AccountSettings } from "@/components/account-settings"

export default async function AccountPage() {
  const user = await getUserSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#ff00ff] to-[#00ffff] drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
          Account Settings
        </h1>
        <AccountSettings user={user} />
      </div>
    </div>
  )
}
