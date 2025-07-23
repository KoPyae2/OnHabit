import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user profile
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Get profile image URL if exists
    let profileImageUrl = null;
    if (user.profileImageId) {
      profileImageUrl = await ctx.storage.getUrl(user.profileImageId);
    }
    
    return {
      _id: user._id,
      name: user.name,
      displayName: user.displayName || user.name,
      email: user.email,
      profileImageUrl, // Custom uploaded image
      googlePhotoUrl: user.photoUrl, // Original Google photo
      bio: user.bio || "",
      timezone: user.timezone || "UTC",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (args.displayName !== undefined) {
      updateData.displayName = args.displayName.trim();
    }
    
    if (args.bio !== undefined) {
      updateData.bio = args.bio.trim();
    }
    
    if (args.timezone !== undefined) {
      updateData.timezone = args.timezone;
    }
    
    await ctx.db.patch(args.userId, updateData);
    return true;
  },
});

// Generate upload URL for profile image
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Update profile photo with uploaded file
export const updateProfilePhoto = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Delete old profile image if exists
    if (user.profileImageId) {
      await ctx.storage.delete(user.profileImageId);
    }
    
    await ctx.db.patch(args.userId, {
      profileImageId: args.storageId,
      updatedAt: Date.now(),
    });
    
    return true;
  },
});

// Remove profile photo (go back to letter avatar)
export const removeProfilePhoto = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Delete the stored image
    if (user.profileImageId) {
      await ctx.storage.delete(user.profileImageId);
    }
    
    await ctx.db.patch(args.userId, {
      profileImageId: undefined,
      updatedAt: Date.now(),
    });
    
    return true;
  },
});

// Get profile statistics
export const getProfileStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get total habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    // Get total check-ins
    const checkins = await ctx.db
      .query("checkins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("checked"), true))
      .collect();
    
    // Calculate current streaks
    let totalCurrentStreak = 0;
    let bestStreak = 0;
    
    for (const habit of habits) {
      const habitCheckins = await ctx.db
        .query("checkins")
        .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
      
      const sortedCheckins = habitCheckins.sort((a, b) => b.date.localeCompare(a.date));
      
      // Calculate current streak for this habit
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      
      for (let i = 0; i < sortedCheckins.length; i++) {
        const checkin = sortedCheckins[i];
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (checkin.date === expectedDateStr && checkin.checked) {
          currentStreak++;
        } else if (checkin.date === expectedDateStr && !checkin.checked) {
          continue;
        } else {
          break;
        }
      }
      
      totalCurrentStreak += currentStreak;
      
      // Calculate best streak for this habit
      let tempStreak = 0;
      let habitBestStreak = 0;
      
      for (const checkin of sortedCheckins.reverse()) {
        if (checkin.checked) {
          tempStreak++;
          habitBestStreak = Math.max(habitBestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      
      bestStreak = Math.max(bestStreak, habitBestStreak);
    }
    
    // Calculate days since joining
    const user = await ctx.db.get(args.userId);
    const daysSinceJoining = user 
      ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
      : 0;
    
    return {
      totalHabits: habits.length,
      totalCheckins: checkins.length,
      currentStreak: totalCurrentStreak,
      bestStreak,
      daysSinceJoining,
      completionRate: habits.length > 0 
        ? Math.round((checkins.length / (habits.length * daysSinceJoining || 1)) * 100)
        : 0,
    };
  },
});