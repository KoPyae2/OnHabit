import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get current month in YYYY-MM format
function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// Create a monthly goal
export const createMonthlyGoal = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.number(),
    unit: v.string(),
    relatedHabits: v.optional(v.array(v.id("habits"))),
  },
  handler: async (ctx, args) => {
    const month = getCurrentMonth();
    
    return await ctx.db.insert("monthlyGoals", {
      userId: args.userId,
      title: args.title,
      description: args.description || "",
      targetValue: args.targetValue,
      currentValue: 0,
      unit: args.unit,
      month,
      relatedHabits: args.relatedHabits || [],
      completed: false,
      createdAt: Date.now(),
    });
  },
});

// Get user's monthly goals
export const getUserMonthlyGoals = query({
  args: { 
    userId: v.id("users"),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const targetMonth = args.month || getCurrentMonth();
    
    return await ctx.db
      .query("monthlyGoals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("month"), targetMonth))
      .collect();
  },
});

// Update goal progress
export const updateGoalProgress = mutation({
  args: {
    goalId: v.id("monthlyGoals"),
    currentValue: v.number(),
  },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) throw new Error("Goal not found");
    
    const completed = args.currentValue >= goal.targetValue;
    
    await ctx.db.patch(args.goalId, {
      currentValue: args.currentValue,
      completed,
    });
    
    return { completed, progress: (args.currentValue / goal.targetValue) * 100 };
  },
});

// Auto-calculate goal progress based on related habits
export const calculateGoalProgress = mutation({
  args: { goalId: v.id("monthlyGoals") },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) throw new Error("Goal not found");
    
    if (goal.relatedHabits.length === 0) return goal.currentValue;
    
    // Get all check-ins for related habits in the goal's month
    const monthStart = `${goal.month}-01`;
    const monthEnd = `${goal.month}-31`;
    
    let totalCompletions = 0;
    
    for (const habitId of goal.relatedHabits) {
      const checkins = await ctx.db
        .query("checkins")
        .withIndex("by_habit", (q) => q.eq("habitId", habitId))
        .filter((q) => 
          q.and(
            q.gte(q.field("date"), monthStart),
            q.lte(q.field("date"), monthEnd),
            q.eq(q.field("userId"), goal.userId),
            q.eq(q.field("checked"), true)
          )
        )
        .collect();
      
      totalCompletions += checkins.length;
    }
    
    const completed = totalCompletions >= goal.targetValue;
    
    await ctx.db.patch(args.goalId, {
      currentValue: totalCompletions,
      completed,
    });
    
    return totalCompletions;
  },
});

// Update a monthly goal
export const updateMonthlyGoal = mutation({
  args: {
    goalId: v.id("monthlyGoals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) throw new Error("Goal not found");
    
    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.targetValue !== undefined) {
      updates.targetValue = args.targetValue;
      // Recalculate completion status
      updates.completed = goal.currentValue >= args.targetValue;
    }
    if (args.unit !== undefined) updates.unit = args.unit;
    
    await ctx.db.patch(args.goalId, updates);
    return await ctx.db.get(args.goalId);
  },
});

// Delete a monthly goal
export const deleteMonthlyGoal = mutation({
  args: { goalId: v.id("monthlyGoals") },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) throw new Error("Goal not found");
    
    await ctx.db.delete(args.goalId);
    return { success: true };
  },
});

// Get goal suggestions based on user habits
export const getGoalSuggestions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get user's active habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    if (habits.length === 0) return [];
    
    // Get current month's check-ins to make smarter suggestions
    const currentMonth = getCurrentMonth();
    const monthStart = `${currentMonth}-01`;
    const monthEnd = `${currentMonth}-31`;
    
    const monthCheckins = await ctx.db
      .query("checkins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), monthStart),
          q.lte(q.field("date"), monthEnd),
          q.eq(q.field("checked"), true)
        )
      )
      .collect();
    
    const totalCheckins = monthCheckins.length;
    const averageDaily = Math.ceil(totalCheckins / new Date().getDate());
    
    // Generate smart suggestions based on habits and current performance
    const suggestions = [
      {
        title: `Complete ${Math.max(50, totalCheckins + 30)} habit check-ins`,
        description: "Build consistency across all your habits",
        targetValue: Math.max(50, totalCheckins + 30),
        unit: "check-ins",
        relatedHabits: habits.map(h => h._id),
      },
      {
        title: "Maintain 7-day streak",
        description: "Keep at least one habit going for a full week",
        targetValue: 7,
        unit: "consecutive days",
        relatedHabits: habits.slice(0, 1).map(h => h._id),
      },
      {
        title: "Perfect week challenge",
        description: "Complete all habits for 7 consecutive days",
        targetValue: habits.length * 7,
        unit: "perfect days",
        relatedHabits: habits.map(h => h._id),
      },
      {
        title: "Try 2 new habits",
        description: "Expand your routine with new healthy habits",
        targetValue: 2,
        unit: "new habits",
        relatedHabits: [],
      },
    ];
    
    return suggestions;
  },
});