"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"

export function SSEFallback({ onRetry }: { onRetry: () => void }) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      onRetry()
    }
  }, [countdown, onRetry])

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className={cn("p-6 rounded-lg", "bg-gray-900/50 border border-gray-800", "text-center max-w-md")}>
        <div className="text-[#ff00ff] mb-4">
          <RefreshCw className="w-12 h-12 mx-auto animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Connection Issue</h3>
        <p className="text-gray-400 mb-4">
          We're having trouble establishing a real-time connection. This could be due to network issues or server load.
        </p>
        <p className="text-gray-400 mb-4">
          Retrying in <span className="text-[#00ffff] font-bold">{countdown}</span> seconds...
        </p>
        <button
          onClick={onRetry}
          className={cn(
            "px-4 py-2 rounded-lg",
            "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
            "text-white font-medium",
            "hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]",
            "transition-all duration-300",
          )}
        >
          Retry Now
        </button>
      </div>
    </div>
  )
}
