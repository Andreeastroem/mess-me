"use client"

import { useState } from "react"
import { login } from "../actions/auth-actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(formData)

      if (!result.success) {
        setError(result.error?.message || "Login failed")
        return
      }

      router.push("/chat")
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div
          className={cn(
            "p-8 rounded-xl",
            "bg-gradient-to-b from-gray-900 to-gray-800",
            "border border-gray-800",
            "shadow-[0_0_30px_rgba(0,0,0,0.8)]",
          )}
        >
          <div className="text-center mb-8">
            <h1
              className={cn(
                "text-3xl font-bold",
                "bg-clip-text text-transparent",
                "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
                "drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]",
              )}
            >
              Neon Chat
            </h1>
            <p className="text-gray-400 mt-2">Enter your credentials to access the chat</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div>
              <div
                className={cn(
                  "relative",
                  "bg-gray-800 rounded-lg",
                  "focus-within:ring-2 focus-within:ring-[#00ffff] focus-within:shadow-[0_0_10px_rgba(0,255,255,0.3)]",
                )}
              >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  className={cn(
                    "w-full bg-transparent py-3 pl-10 pr-4",
                    "text-white placeholder-gray-400",
                    "focus:outline-none rounded-lg",
                  )}
                />
              </div>
            </div>

            <div>
              <div
                className={cn(
                  "relative",
                  "bg-gray-800 rounded-lg",
                  "focus-within:ring-2 focus-within:ring-[#00ffff] focus-within:shadow-[0_0_10px_rgba(0,255,255,0.3)]",
                )}
              >
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className={cn(
                    "w-full bg-transparent py-3 pl-10 pr-4",
                    "text-white placeholder-gray-400",
                    "focus:outline-none rounded-lg",
                  )}
                />
              </div>
            </div>

            {error && (
              <div className={cn("p-3 rounded-lg text-sm", "bg-red-900/30 text-red-200", "border border-red-800")}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 px-4 rounded-lg",
                "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
                "text-white font-medium",
                "hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-sm text-gray-500">
              This is an invite-only platform. Contact an administrator for access.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
