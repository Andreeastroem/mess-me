"use server"

import { sql } from "@/lib/db"

export async function seedTestUser() {
  try {
    // Check if test user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = 'test@example.com'
    `

    if (existingUsers.length > 0) {
      return { success: true, message: "Test user already exists" }
    }

    // Create test user
    // In a real app, you would hash the password
    await sql`
      INSERT INTO users (username, email, password_hash, display_name, status)
      VALUES ('testuser', 'test@example.com', 'password123', 'Test User', 'online')
    `

    return { success: true, message: "Test user created successfully" }
  } catch (error) {
    console.error("Error seeding test user:", error)
    return { success: false, message: "Failed to create test user" }
  }
}
