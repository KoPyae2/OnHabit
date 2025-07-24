import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Create or update a check-in for today with mood and sync features
export const toggleCheckin = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    date: v.optional(v.string()), // Add optional date parameter
    note: v.optional(v.string()),
    mood: v.optional(v.union(v.literal("excellent"), v.literal("good"), v.literal("neutral"), v.literal("bad"), v.literal("terrible"))),
    syncedWithPartner: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("Habit not found");

    // Check if user can check-in for this habit
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const canCheckIn = habit.ownerId === args.userId || 
                      (habit.coupleId && habit.coupleId === user.coupleId);
    
    if (!canCheckIn) throw new Error("Not authorized to check-in for this habit");

    const targetDate = args.date || getTodayDate();

    // Check if there's already a check-in for the target date
    const existingCheckin = await ctx.db
      .query("checkins")
      .withIndex("by_habit_user_date", (q) => 
        q.eq("habitId", args.habitId)
         .eq("userId", args.userId)
         .eq("date", targetDate)
      )
      .unique();

    if (existingCheckin) {
      // Toggle existing check-in
      const updateData: any = {
        checked: !existingCheckin.checked,
        note: args.note || existingCheckin.note,
      };
      
      // Only update mood and sync if checking in (not unchecking)
      if (!existingCheckin.checked) {
        updateData.completedAt = Date.now();
        if (args.mood) updateData.mood = args.mood;
        if (args.syncedWithPartner) updateData.syncedWithPartner = args.syncedWithPartner;
      }
      
      await ctx.db.patch(existingCheckin._id, updateData);
      return existingCheckin._id;
    } else {
      // Create new check-in
      return await ctx.db.insert("checkins", {
        habitId: args.habitId,
        userId: args.userId,
        date: targetDate,
        checked: true,
        note: args.note || "",
        mood: args.mood,
        completedAt: Date.now(),
        syncedWithPartner: args.syncedWithPartner || false,
      });
    }
  },
});

// Get today's check-ins for a user
export const getTodaysCheckins = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = getTodayDate();
    
    return await ctx.db
      .query("checkins")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .collect();
  },
});

// Get today's check-ins for user and their partner (for couple habits)
export const getTodaysCheckinsForCouple = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = getTodayDate();
    const user = await ctx.db.get(args.userId);
    
    if (!user || !user.coupleId) {
      // If no couple, just return user's checkins
      return await ctx.db
        .query("checkins")
        .withIndex("by_user_date", (q) => 
          q.eq("userId", args.userId).eq("date", today)
        )
        .collect();
    }

    // Get couple info to find partner
    const couple = await ctx.db.get(user.coupleId);
    if (!couple) {
      return await ctx.db
        .query("checkins")
        .withIndex("by_user_date", (q) => 
          q.eq("userId", args.userId).eq("date", today)
        )
        .collect();
    }

    // Get all users in the couple
    const coupleUserIds = couple.users;
    
    // Get today's checkins for all users in the couple
    const allCheckins = await Promise.all(
      coupleUserIds.map(userId => 
        ctx.db
          .query("checkins")
          .withIndex("by_user_date", (q) => 
            q.eq("userId", userId).eq("date", today)
          )
          .collect()
      )
    );

    // Flatten the results
    return allCheckins.flat();
  },
});

// Get check-ins for a specific date
export const getCheckinsForDate = query({
  args: { 
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("checkins")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();
  },
});

// Get check-ins for a specific month
export const getMonthCheckins = query({
  args: { 
    userId: v.id("users"),
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    const startDate = `${args.year}-${args.month.toString().padStart(2, '0')}-01`;
    const endDate = `${args.year}-${args.month.toString().padStart(2, '0')}-31`;
    
    return await ctx.db
      .query("checkins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();
  },
});

// Get check-ins for a specific habit and date range
export const getHabitCheckins = query({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    days: v.optional(v.number()), // Default to 30 days
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) return [];

    // Check if user can view this habit's check-ins
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    const canView = habit.ownerId === args.userId || 
                   (habit.coupleId && habit.coupleId === user.coupleId);
    
    if (!canView) return [];

    // Get check-ins for the habit
    const checkins = await ctx.db
      .query("checkins")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .order("desc")
      .take(args.days || 30);

    return checkins;
  },
});

// Update check-in note
export const updateCheckinNote = mutation({
  args: {
    checkinId: v.id("checkins"),
    userId: v.id("users"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin) throw new Error("Check-in not found");

    // Only the user who made the check-in can update the note
    if (checkin.userId !== args.userId) {
      throw new Error("Not authorized to update this check-in");
    }

    await ctx.db.patch(args.checkinId, { note: args.note });
    return args.checkinId;
  },
});

// Update check-in mood
export const updateCheckinMood = mutation({
  args: {
    checkinId: v.id("checkins"),
    userId: v.id("users"),
    mood: v.union(v.literal("excellent"), v.literal("good"), v.literal("neutral"), v.literal("bad"), v.literal("terrible")),
  },
  handler: async (ctx, args) => {
    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin) throw new Error("Check-in not found");

    // Only the user who made the check-in can update the mood
    if (checkin.userId !== args.userId) {
      throw new Error("Not authorized to update this check-in");
    }

    await ctx.db.patch(args.checkinId, { mood: args.mood });
    return args.checkinId;
  },
});

// Get check-in statistics for a habit
export const getHabitStats = query({
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

    // Get all check-ins for this habit by this user
    const allCheckins = await ctx.db
      .query("checkins")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const completedCheckins = allCheckins.filter(c => c.checked);
    const totalCheckins = allCheckins.length;
    const completionRate = totalCheckins > 0 ? (completedCheckins.length / totalCheckins) * 100 : 0;

    // Calculate current streak
    const sortedCheckins = allCheckins.sort((a, b) => b.date.localeCompare(a.date));
    let currentStreak = 0;
    const today = getTodayDate();
    
    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkin = sortedCheckins[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (checkin.date === expectedDateStr && checkin.checked) {
        currentStreak++;
      } else if (checkin.date === expectedDateStr && !checkin.checked) {
        // Skip missed days but continue checking for earlier completions
        continue;
      } else {
        break;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (const checkin of sortedCheckins.reverse()) {
      if (checkin.checked) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate average mood if mood data exists
    const moodCheckins = completedCheckins.filter(c => c.mood);
    const averageMood = moodCheckins.length > 0 
      ? moodCheckins.reduce((sum, c) => {
          const moodValue = c.mood === "excellent" ? 5 : 
                           c.mood === "good" ? 4 : 
                           c.mood === "neutral" ? 3 : 
                           c.mood === "bad" ? 2 : 1;
          return sum + moodValue;
        }, 0) / moodCheckins.length
      : null;

    return {
      totalCheckins,
      completedCheckins: completedCheckins.length,
      completionRate: Math.round(completionRate),
      currentStreak,
      bestStreak,
      averageMood: averageMood ? Math.round(averageMood * 10) / 10 : null,
      moodData: moodCheckins.length,
    };
  },
});

// Check if partner completed the same habit today (for sync bonus)
export const checkPartnerSync = query({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit || !habit.coupleId) return null;

    const user = await ctx.db.get(args.userId);
    if (!user || !user.coupleId) return null;

    // Get couple info to find partner
    const couple = await ctx.db.get(user.coupleId);
    if (!couple) return null;

    const partnerId = couple.users.find(id => id !== args.userId);
    if (!partnerId) return null;

    const today = getTodayDate();

    // Check if both users completed the habit today
    const userCheckin = await ctx.db
      .query("checkins")
      .withIndex("by_habit_user_date", (q) => 
        q.eq("habitId", args.habitId)
         .eq("userId", args.userId)
         .eq("date", today)
      )
      .unique();

    const partnerCheckin = await ctx.db
      .query("checkins")
      .withIndex("by_habit_user_date", (q) => 
        q.eq("habitId", args.habitId)
         .eq("userId", partnerId)
         .eq("date", today)
      )
      .unique();

    const bothCompleted = userCheckin?.checked && partnerCheckin?.checked;
    const partner = await ctx.db.get(partnerId);

    return {
      bothCompleted,
      userCompleted: userCheckin?.checked || false,
      partnerCompleted: partnerCheckin?.checked || false,
      partnerName: partner?.name || "Partner",
      canSync: habit.coupleId === user.coupleId,
    };
  },
});

// Get habit insights and patterns
export const getHabitInsights = query({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) return null;

    // Get last 30 days of check-ins
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const checkins = await ctx.db
      .query("checkins")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const recentCheckins = checkins.filter(c => 
      new Date(c.date) >= thirtyDaysAgo
    );

    // Analyze patterns
    const dayPatterns: { [key: string]: { completed: number; total: number } } = {};
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    recentCheckins.forEach(checkin => {
      const date = new Date(checkin.date);
      const dayName = weekdays[date.getDay()];
      
      if (!dayPatterns[dayName]) {
        dayPatterns[dayName] = { completed: 0, total: 0 };
      }
      
      dayPatterns[dayName].total++;
      if (checkin.checked) {
        dayPatterns[dayName].completed++;
      }
    });

    // Find best performing days
    const bestDays = Object.entries(dayPatterns)
      .map(([day, stats]) => ({
        day,
        rate: stats.total > 0 ? stats.completed / stats.total : 0,
        total: stats.total,
      }))
      .filter(d => d.total >= 2) // Only consider days with at least 2 data points
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

    // Analyze mood correlation
    const moodStats = recentCheckins
      .filter(c => c.checked && c.mood)
      .reduce((acc, c) => {
        const mood = c.mood!;
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    const totalMoodEntries = Object.values(moodStats).reduce((sum, count) => sum + count, 0);
    const dominantMood = totalMoodEntries > 0 
      ? Object.entries(moodStats).sort(([,a], [,b]) => b - a)[0][0]
      : null;

    return {
      bestDays: bestDays.map(d => d.day),
      dayPatterns,
      moodStats,
      dominantMood,
      totalMoodEntries,
      recentCompletionRate: recentCheckins.length > 0 
        ? Math.round((recentCheckins.filter(c => c.checked).length / recentCheckins.length) * 100)
        : 0,
    };
  },
});
