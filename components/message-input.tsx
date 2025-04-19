"use client"

import type React from "react"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Smile, Send } from "lucide-react"
import { sendMessage } from "@/app/actions/message-actions"

type MessageInputProps = {
  conversationId: number
  userId: number
}

export function MessageInput({ conversationId, userId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    if (message.trim() === "") return

    setIsLoading(true)
    try {
      const result = await sendMessage(conversationId, userId, formData)

      if (result.success) {
        setMessage("")
        formRef.current?.reset()
      } else {
        // Handle error
        console.error("Failed to send message:", result.errors)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() !== "") {
        formRef.current?.requestSubmit()
      }
    }
  }

  return (
    <div className="p-4 border-t border-gray-800">
      <form ref={formRef} action={handleSubmit} className="flex items-end gap-2">
        <div
          className={cn(
            "flex-1 relative",
            "bg-gray-800 rounded-lg",
            "focus-within:ring-2 focus-within:ring-[#00ffff] focus-within:shadow-[0_0_10px_rgba(0,255,255,0.3)]",
          )}
        >
          <button
            type="button"
            className={cn(
              "absolute left-3 bottom-3",
              "text-gray-400 hover:text-[#00ffff]",
              "transition-colors duration-200",
            )}
          >
            <Smile className="w-5 h-5" />
          </button>

          <textarea
            name="content"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              "w-full bg-transparent py-3 pl-10 pr-4",
              "text-white placeholder-gray-400",
              "focus:outline-none rounded-lg",
              "resize-none",
              "min-h-[44px] max-h-[120px]",
            )}
            rows={1}
            style={{
              height: "auto",
              minHeight: "44px",
              maxHeight: "120px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || message.trim() === ""}
          className={cn(
            "p-3 rounded-full",
            "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
            "text-white",
            "hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center",
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
