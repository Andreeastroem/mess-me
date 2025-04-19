"use server";

import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthError = {
  message: string;
};

export async function login(
  formData: FormData
): Promise<{ success: boolean; error?: AuthError; userId?: number }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: { message: "Email and password are required" },
    };
  }

  try {
    // In a real app, you would hash the password and compare with the stored hash
    // This is a simplified version for demonstration
    const users = await sql`
      SELECT id, email, password_hash 
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return {
        success: false,
        error: { message: "Invalid email or password" },
      };
    }

    const user = users[0];

    // In a real app, you would use a proper password comparison
    // For demo purposes, we're just checking if the password exists in the DB
    // IMPORTANT: In production, always use proper password hashing and verification
    if (user.password_hash !== password) {
      return {
        success: false,
        error: { message: "Invalid email or password" },
      };
    }

    // Set a cookie to maintain the session
    // In a real app, you would use a proper session management system
    cookies().set("userId", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return {
      success: true,
      userId: user.id,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: { message: "An error occurred during login" },
    };
  }
}

export async function logout() {
  cookies().delete("userId");
  redirect("/login");
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return null;
  }

  try {
    const users = await sql`
      SELECT id, username, display_name, avatar_url, status
      FROM users
      WHERE id = ${Number.parseInt(userId)}
    `;

    if (users.length === 0) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}
