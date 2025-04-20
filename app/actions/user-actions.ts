"use server";

import { sql, User } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define validation schema for profile updates
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  display_name: z
    .string()
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
  confirm_password: z
    .string()
    .min(8, "Confirm password must be at least 8 characters"),
});

export async function updateUserProfile(userId: number, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const display_name = formData.get("display_name") as string;
    const bio = formData.get("bio") as string;

    // Validate the input
    const result = profileSchema.safeParse({
      username,
      display_name: display_name || null,
      bio: bio || null,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUsers = await sql`
        SELECT id FROM users WHERE username = ${username} AND id != ${userId}
      `;

      if (existingUsers.length > 0) {
        return {
          success: false,
          errors: {
            username: ["Username is already taken"],
          },
        };
      }
    }

    // Update the user profile
    await sql`
      UPDATE users
      SET 
        username = ${username},
        display_name = ${display_name || null},
        bio = ${bio || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    revalidatePath("/account");
    revalidatePath("/chat");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      errors: {
        _form: ["An error occurred while updating your profile"],
      },
    };
  }
}

export async function updateUserPassword(userId: number, formData: FormData) {
  try {
    const current_password = formData.get("current_password") as string;
    const new_password = formData.get("new_password") as string;
    const confirm_password = formData.get("confirm_password") as string;

    // Validate the input
    const result = passwordSchema.safeParse({
      current_password,
      new_password,
      confirm_password,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    // Check if passwords match
    if (new_password !== confirm_password) {
      return {
        success: false,
        errors: {
          confirm_password: ["Passwords do not match"],
        },
      };
    }

    // Verify current password
    const users = await sql`
      SELECT password_hash FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return {
        success: false,
        errors: {
          _form: ["User not found"],
        },
      };
    }

    // In a real app, you would hash the password and compare with the stored hash
    // This is a simplified version for demonstration
    if (users[0].password_hash !== current_password) {
      return {
        success: false,
        errors: {
          current_password: ["Current password is incorrect"],
        },
      };
    }

    // Update the password
    await sql`
      UPDATE users
      SET 
        password_hash = ${new_password},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      errors: {
        _form: ["An error occurred while updating your password"],
      },
    };
  }
}

export async function updateUserAvatar(userId: number, formData: FormData) {
  try {
    const avatar_url = formData.get("avatar_url") as string;

    // In a real app, you would handle file uploads here
    // For this demo, we'll just update the avatar URL

    await sql`
      UPDATE users
      SET 
        avatar_url = ${avatar_url},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    revalidatePath("/account");
    revalidatePath("/chat");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return {
      success: false,
      error: "An error occurred while updating your avatar",
    };
  }
}

export async function findUsersByDisplayName(displayName: string) {
  const displayNameWithWildcard = `${displayName}%`;

  try {
    const users = (await sql`
    SELECT id, username, display_name, avatar_url
    FROM users
      WHERE display_name LIKE ${displayNameWithWildcard}
      LIMIT 10
    `) as User[];

    return users;
  } catch (error) {
    console.error("Error finding users by display name:", error);
    return [];
  }
}
