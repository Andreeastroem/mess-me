"use client";

import { useState } from "react";
import {
  updateUserProfile,
  updateUserPassword,
  updateUserAvatar,
} from "@/app/actions/user-actions";
import type { User } from "@/lib/db";
import { cn } from "@/lib/utils";
import { ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import Link from "next/link";

type AccountSettingsProps = {
  user: User;
};

export function AccountSettings({ user }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "avatar">(
    "profile"
  );
  const [profileStatus, setProfileStatus] = useState<{
    loading: boolean;
    success: boolean;
    errors?: Record<string, string[]>;
  }>({
    loading: false,
    success: false,
  });
  const [passwordStatus, setPasswordStatus] = useState<{
    loading: boolean;
    success: boolean;
    errors?: Record<string, string[]>;
  }>({
    loading: false,
    success: false,
  });
  const [avatarStatus, setAvatarStatus] = useState<{
    loading: boolean;
    success: boolean;
    error?: string;
  }>({
    loading: false,
    success: false,
  });

  async function handleProfileSubmit(formData: FormData) {
    setProfileStatus({ loading: true, success: false });
    try {
      const result = await updateUserProfile(user.id, formData);
      if (result.success) {
        setProfileStatus({ loading: false, success: true });
        // Reset success message after 3 seconds
        setTimeout(() => {
          setProfileStatus((prev) => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setProfileStatus({
          loading: false,
          success: false,
          errors: result.errors,
        });
      }
    } catch (error) {
      console.error(error);
      setProfileStatus({
        loading: false,
        success: false,
        errors: { _form: ["An unexpected error occurred"] },
      });
    }
  }

  async function handlePasswordSubmit(formData: FormData) {
    setPasswordStatus({ loading: true, success: false });
    try {
      const result = await updateUserPassword(user.id, formData);
      if (result.success) {
        setPasswordStatus({ loading: false, success: true });
        // Reset form
        const form = document.getElementById(
          "password-form"
        ) as HTMLFormElement;
        form.reset();
        // Reset success message after 3 seconds
        setTimeout(() => {
          setPasswordStatus((prev) => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setPasswordStatus({
          loading: false,
          success: false,
          errors: result.errors,
        });
      }
    } catch (error) {
      console.error(error);
      setPasswordStatus({
        loading: false,
        success: false,
        errors: { _form: ["An unexpected error occurred"] },
      });
    }
  }

  async function handleAvatarSubmit(formData: FormData) {
    setAvatarStatus({ loading: true, success: false });
    try {
      const result = await updateUserAvatar(user.id, formData);
      if (result.success) {
        setAvatarStatus({ loading: false, success: true });
        // Reset success message after 3 seconds
        setTimeout(() => {
          setAvatarStatus((prev) => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setAvatarStatus({
          loading: false,
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error(error);
      setAvatarStatus({
        loading: false,
        success: false,
        error: "An unexpected error occurred",
      });
    }
  }

  return (
    <div
      className={cn(
        "p-6 rounded-xl",
        "bg-gradient-to-b from-gray-900 to-gray-800",
        "border border-gray-800",
        "shadow-[0_0_30px_rgba(0,0,0,0.8)]"
      )}
    >
      <div className="flex items-center mb-6">
        <Link
          href="/chat"
          className={cn(
            "flex items-center text-gray-400 hover:text-white mr-4",
            "transition-colors duration-200"
          )}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back</span>
        </Link>
        <div className="flex-1"></div>
      </div>

      <div className="flex border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-4 py-2 font-medium",
            activeTab === "profile"
              ? "text-[#ff00ff] border-b-2 border-[#ff00ff]"
              : "text-gray-400 hover:text-white"
          )}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={cn(
            "px-4 py-2 font-medium",
            activeTab === "password"
              ? "text-[#00ffff] border-b-2 border-[#00ffff]"
              : "text-gray-400 hover:text-white"
          )}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab("avatar")}
          className={cn(
            "px-4 py-2 font-medium",
            activeTab === "avatar"
              ? "text-[#ff00ff] border-b-2 border-[#ff00ff]"
              : "text-gray-400 hover:text-white"
          )}
        >
          Avatar
        </button>
      </div>

      {activeTab === "profile" && (
        <form action={handleProfileSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={user.username}
              required
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-gray-800 text-white",
                "border border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-[#ff00ff] focus:border-transparent",
                "transition-all duration-200"
              )}
            />
            {profileStatus.errors?.username && (
              <p className="mt-1 text-sm text-red-400">
                {profileStatus.errors.username[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="display_name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Display Name
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              defaultValue={user.display_name || ""}
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-gray-800 text-white",
                "border border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-[#ff00ff] focus:border-transparent",
                "transition-all duration-200"
              )}
            />
            {profileStatus.errors?.display_name && (
              <p className="mt-1 text-sm text-red-400">
                {profileStatus.errors.display_name[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={user.bio || ""}
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-gray-800 text-white",
                "border border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-[#ff00ff] focus:border-transparent",
                "transition-all duration-200",
                "resize-none"
              )}
            />
            {profileStatus.errors?.bio && (
              <p className="mt-1 text-sm text-red-400">
                {profileStatus.errors.bio[0]}
              </p>
            )}
          </div>

          {profileStatus.errors?._form && (
            <div className="p-3 rounded-lg text-sm bg-red-900/30 text-red-200 border border-red-800">
              {profileStatus.errors._form[0]}
            </div>
          )}

          {profileStatus.success && (
            <div className="p-3 rounded-lg text-sm bg-green-900/30 text-green-200 border border-green-800 flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Profile updated successfully
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={profileStatus.loading}
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
                "text-white font-medium",
                "hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center"
              )}
            >
              {profileStatus.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "password" && (
        <form
          id="password-form"
          action={handlePasswordSubmit}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="current_password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Current Password
            </label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              required
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-gray-800 text-white",
                "border border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:border-transparent",
                "transition-all duration-200"
              )}
            />
            {passwordStatus.errors?.current_password && (
              <p className="mt-1 text-sm text-red-400">
                {passwordStatus.errors.current_password[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              required
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-gray-800 text-white",
                "border border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:border-transparent",
                "transition-all duration-200"
              )}
            />
            {passwordStatus.errors?.new_password && (
              <p className="mt-1 text-sm text-red-400">
                {passwordStatus.errors.new_password[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              required
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-gray-800 text-white",
                "border border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:border-transparent",
                "transition-all duration-200"
              )}
            />
            {passwordStatus.errors?.confirm_password && (
              <p className="mt-1 text-sm text-red-400">
                {passwordStatus.errors.confirm_password[0]}
              </p>
            )}
          </div>

          {passwordStatus.errors?._form && (
            <div className="p-3 rounded-lg text-sm bg-red-900/30 text-red-200 border border-red-800">
              {passwordStatus.errors._form[0]}
            </div>
          )}

          {passwordStatus.success && (
            <div className="p-3 rounded-lg text-sm bg-green-900/30 text-green-200 border border-green-800 flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Password updated successfully
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={passwordStatus.loading}
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-gradient-to-r from-[#00ffff] to-[#ff00ff]",
                "text-white font-medium",
                "hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center"
              )}
            >
              {passwordStatus.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "avatar" && (
        <form action={handleAvatarSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-32 h-32 rounded-full mb-4",
                "bg-gradient-to-br from-purple-600 to-blue-500",
                "flex items-center justify-center",
                "text-white text-4xl font-bold",
                "relative",
                "border-4 border-gray-800",
                "shadow-[0_0_20px_rgba(255,0,255,0.3)]"
              )}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
              <div
                className={cn(
                  "absolute bottom-0 right-0",
                  "w-8 h-8 rounded-full",
                  "bg-[#ff00ff]",
                  "flex items-center justify-center",
                  "text-white",
                  "shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                )}
              >
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Enter a URL for your avatar image. In a real app, you would be
              able to upload an image.
            </p>

            <input
              type="url"
              id="avatar_url"
              name="avatar_url"
              placeholder="https://example.com/avatar.jpg"
              defaultValue={user.avatar_url || ""}
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-gray-800 text-white",
                "border border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-[#ff00ff] focus:border-transparent",
                "transition-all duration-200"
              )}
            />
          </div>

          {avatarStatus.error && (
            <div className="p-3 rounded-lg text-sm bg-red-900/30 text-red-200 border border-red-800">
              {avatarStatus.error}
            </div>
          )}

          {avatarStatus.success && (
            <div className="p-3 rounded-lg text-sm bg-green-900/30 text-green-200 border border-green-800 flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Avatar updated successfully
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={avatarStatus.loading}
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-gradient-to-r from-[#ff00ff] to-[#00ffff]",
                "text-white font-medium",
                "hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center"
              )}
            >
              {avatarStatus.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Avatar"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
