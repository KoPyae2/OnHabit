import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a 6-digit invite code
function generateInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create an invite code for a user
export const createInviteCode = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user is already in a couple
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.coupleId) throw new Error("User is already in a couple");

    // Generate unique invite code
    let inviteCode: string;
    let existingCouple;
    do {
      inviteCode = generateInviteCode();
      existingCouple = await ctx.db
        .query("couples")
        .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
        .unique();
    } while (existingCouple);

    // Create couple with the user
    const coupleId = await ctx.db.insert("couples", {
      users: [args.userId],
      inviteCode,
      createdAt: Date.now(),
    });

    // Update user with couple ID
    await ctx.db.patch(args.userId, { coupleId });

    return { coupleId, inviteCode };
  },
});

// Join a couple using invite code
export const joinCouple = mutation({
  args: { 
    userId: v.id("users"), 
    inviteCode: v.string() 
  },
  handler: async (ctx, args) => {
    // Check if user is already in a couple
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.coupleId) throw new Error("User is already in a couple");

    // Find couple by invite code
    const couple = await ctx.db
      .query("couples")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!couple) throw new Error("Invalid invite code");
    if (couple.users.length >= 2) throw new Error("Couple is already full");

    // Add user to couple
    await ctx.db.patch(couple._id, {
      users: [...couple.users, args.userId],
    });

    // Update user with couple ID
    await ctx.db.patch(args.userId, { coupleId: couple._id });

    return couple._id;
  },
});

// Leave couple
export const leaveCouple = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.coupleId) throw new Error("User is not in a couple");

    const couple = await ctx.db.get(user.coupleId);
    if (!couple) throw new Error("Couple not found");

    // Remove user from couple
    const updatedUsers = couple.users.filter(id => id !== args.userId);
    
    if (updatedUsers.length === 0) {
      // Delete couple if no users left
      await ctx.db.delete(couple._id);
    } else {
      // Update couple with remaining users
      await ctx.db.patch(couple._id, { users: updatedUsers });
    }

    // Remove couple ID from user
    await ctx.db.patch(args.userId, { coupleId: undefined });

    return true;
  },
});

// Get couple by invite code
export const getCoupleByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("couples")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();
  },
});

// Get couple info by user ID
export const getCoupleInfo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.coupleId) return null;
    
    const couple = await ctx.db.get(user.coupleId);
    if (!couple) return null;
    
    // Get partner info if exists
    const partnerId = couple.users.find(id => id !== args.userId);
    const partner = partnerId ? await ctx.db.get(partnerId) : null;
    
    // Get partner's profile image URL if they have uploaded a custom image
    let partnerProfileImageUrl = null;
    if (partner?.profileImageId) {
      partnerProfileImageUrl = await ctx.storage.getUrl(partner.profileImageId);
    }
    
    return {
      coupleId: couple._id,
      inviteCode: couple.inviteCode,
      hasPartner: couple.users.length === 2,
      partner: partner ? {
        name: partner.name,
        displayName: partner.displayName || partner.name,
        photoUrl: partner.photoUrl, // Google photo (fallback)
        profileImageUrl: partnerProfileImageUrl, // Custom uploaded image (priority)
        email: partner.email,
      } : null,
    };
  },
});
