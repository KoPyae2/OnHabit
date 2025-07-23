import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    googleId: v.string(),
    email: v.string(),
    name: v.string(),
    displayName: v.optional(v.string()), // Editable display name
    photoUrl: v.optional(v.string()), // Google photo URL (not used by default)
    profileImageId: v.optional(v.id("_storage")), // Convex file storage ID
    bio: v.optional(v.string()), // User bio
    timezone: v.optional(v.string()), // User timezone
    coupleId: v.optional(v.id("couples")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_googleId", ["googleId"]),

  couples: defineTable({
    users: v.array(v.id("users")), // Max 2 users
    inviteCode: v.string(),
    createdAt: v.number(),
  }).index("by_inviteCode", ["inviteCode"]),

  habits: defineTable({
    ownerId: v.id("users"),
    coupleId: v.optional(v.id("couples")), // null = solo habit
    title: v.string(),
    createdAt: v.number(),
    active: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_couple", ["coupleId"]),

  checkins: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    date: v.string(), // "YYYY-MM-DD" format
    note: v.optional(v.string()),
    checked: v.boolean(),
    mood: v.optional(v.union(v.literal("excellent"), v.literal("good"), v.literal("neutral"), v.literal("bad"), v.literal("terrible"))), // Mood after completing habit
    completedAt: v.optional(v.number()), // Timestamp when completed
    syncedWithPartner: v.optional(v.boolean()), // If completed together with partner
  })
    .index("by_habit", ["habitId"])
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_habit_user_date", ["habitId", "userId", "date"])
    .index("by_date", ["date"]),

  // New table for habit insights and analytics
  habitInsights: defineTable({
    userId: v.id("users"),
    habitId: v.id("habits"),
    weeklyStreak: v.number(),
    monthlyStreak: v.number(),
    bestStreak: v.number(),
    averageMood: v.optional(v.number()), // 1-3 scale
    preferredDays: v.array(v.string()), // ["monday", "tuesday", etc.]
    lastAnalyzed: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_habit", ["habitId"]),

  // New table for monthly goals
  monthlyGoals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.number(),
    currentValue: v.number(),
    unit: v.string(), // "habits", "days", "books", etc.
    month: v.string(), // "2025-01" format
    relatedHabits: v.array(v.id("habits")),
    completed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_month", ["month"]),
});
