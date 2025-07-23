# OneHabit - Convex Backend Functions

Welcome to the OneHabit Convex backend! This directory contains all the database functions for our habit tracking application.

## 🛠️ Tech Stack

- **Backend**: Convex (Real-time database & functions)
- **Frontend**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Google OAuth
- **UI**: Tailwind CSS + Radix UI components
- **Language**: TypeScript
- **Deployment**: Vercel (Frontend) + Convex (Backend)

## 📁 Database Schema

### Core Tables
- **`users`** - User profiles and authentication data
- **`habits`** - Habit definitions and settings
- **`checkins`** - Daily habit completion records
- **`goals`** - Monthly goals and progress tracking
- **`partnerships`** - Partner connections and sync bonuses

## 🔧 Key Functions

### User Management
```ts
// convex/users.ts
export const createOrUpdateUser = mutation({
  args: {
    googleId: v.string(),
    email: v.string(),
    name: v.string(),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create or update user profile
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_google_id", (q) => q.eq("googleId", args.googleId))
      .first();
    
    if (existingUser) {
      await ctx.db.patch(existingUser._id, args);
      return existingUser._id;
    } else {
      return await ctx.db.insert("users", args);
    }
  },
});
```

### Habit Tracking
```ts
// convex/habits.ts
export const createHabit = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    frequency: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("habits", {
      ...args,
      createdAt: Date.now(),
      isActive: true,
    });
  },
});

export const getUserHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
```

### Check-ins & Progress
```ts
// convex/checkins.ts
export const toggleHabitCheckin = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    mood: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_habit_user_date", (q) => 
        q.eq("habitId", args.habitId)
         .eq("userId", args.userId)
         .eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { completed: false };
    } else {
      await ctx.db.insert("checkins", {
        ...args,
        completedAt: Date.now(),
      });
      return { completed: true };
    }
  },
});
```

### Goals System
```ts
// convex/goals.ts
export const createGoal = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.number(),
    unit: v.string(),
    month: v.string(), // YYYY-MM format
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("goals", {
      ...args,
      currentValue: 0,
      createdAt: Date.now(),
      isActive: true,
    });
  },
});
```

## 🚀 Usage in React Components

### Querying Data
```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function HabitsList({ userId }: { userId: string }) {
  const habits = useQuery(api.habits.getUserHabits, { userId });
  
  if (!habits) return <div>Loading...</div>;
  
  return (
    <div>
      {habits.map(habit => (
        <div key={habit._id}>{habit.title}</div>
      ))}
    </div>
  );
}
```

### Mutating Data
```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function HabitCheckbox({ habitId, userId }: Props) {
  const toggleCheckin = useMutation(api.checkins.toggleHabitCheckin);
  
  const handleToggle = async () => {
    await toggleCheckin({
      habitId,
      userId,
      date: new Date().toISOString().split('T')[0],
    });
  };
  
  return <button onClick={handleToggle}>Toggle</button>;
}
```

## 📊 Advanced Features

- **Real-time Updates**: All data syncs instantly across devices
- **Habit Analytics**: Pattern analysis and insights
- **Partner Sync**: Shared habits with sync bonuses
- **Goal Tracking**: Monthly goals with progress monitoring
- **Streak Calculation**: Automatic streak counting and best streak tracking

## 🔧 Development Commands

```bash
# Push schema and functions to Convex
npx convex dev

# Deploy to production
npx convex deploy

# View dashboard
npx convex dashboard

# Generate types
npx convex codegen
```

## 📚 Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Database Queries](https://docs.convex.dev/database/reading-data)
- [Mutations](https://docs.convex.dev/database/writing-data)
- [Real-time Subscriptions](https://docs.convex.dev/client/react)
