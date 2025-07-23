import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new habit
export const createHabit = mutation({
  args: {
    ownerId: v.id("users"),
    title: v.string(),
    isShared: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.ownerId);
    if (!user) throw new Error("User not found");

    // If habit is shared and user has a couple, set coupleId
    let coupleId = undefined;
    if (args.isShared && user.coupleId) {
      coupleId = user.coupleId;
    }

    return await ctx.db.insert("habits", {
      ownerId: args.ownerId,
      coupleId,
      title: args.title,
      active: true,
      createdAt: Date.now(),
    });
  },
});

// Get all habits for a user (personal + shared)
export const getUserHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    // Get personal habits
    const personalHabits = await ctx.db
      .query("habits")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Get shared habits if user is in a couple
    let sharedHabits: any[] = [];
    if (user.coupleId) {
      sharedHabits = await ctx.db
        .query("habits")
        .withIndex("by_couple", (q) => q.eq("coupleId", user.coupleId))
        .filter((q) => q.and(
          q.neq(q.field("ownerId"), args.userId), // Not owned by current user
          q.eq(q.field("active"), true)
        ))
        .collect();
    }

    return [...personalHabits, ...sharedHabits];
  },
});

// Update habit
export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("Habit not found");

    // Check if user can edit this habit
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const canEdit = habit.ownerId === args.userId || 
                   (habit.coupleId && habit.coupleId === user.coupleId);
    
    if (!canEdit) throw new Error("Not authorized to edit this habit");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.active !== undefined) updates.active = args.active;

    await ctx.db.patch(args.habitId, updates);
    return args.habitId;
  },
});

// Delete habit (set inactive)
export const deleteHabit = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("Habit not found");

    // Only the owner can delete a habit
    if (habit.ownerId !== args.userId) {
      throw new Error("Only the habit owner can delete it");
    }

    await ctx.db.patch(args.habitId, { active: false });
    return args.habitId;
  },
});

// Get habit details with recent check-ins
export const getHabitDetails = query({
  args: { 
    habitId: v.id("habits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) return null;

    // Check if user can view this habit
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const canView = habit.ownerId === args.userId || 
                   (habit.coupleId && habit.coupleId === user.coupleId);
    
    if (!canView) return null;

    // Get recent check-ins for this habit
    const checkIns = await ctx.db
      .query("checkins")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .order("desc")
      .take(30); // Last 30 check-ins

    return {
      habit,
      checkIns,
    };
  },
});
