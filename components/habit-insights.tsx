"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Heart, 
  Lightbulb, 
  Target,
  Clock,
  Zap
} from "lucide-react";

interface HabitInsightsProps {
  userId: Id<"users">;
  habits: any[];
}

export function HabitInsights({ userId, habits }: HabitInsightsProps) {
  // Get insights for each habit - only if habits exist
  const habitInsights = habits.length > 0 ? habits.map(habit => 
    useQuery(api.checkins.getHabitInsights, {
      habitId: habit._id,
      userId: userId,
    })
  ) : [];

  const generateInsights = () => {
    const insights = [];
    
    // Analyze all habits together
    const validInsights = habitInsights.filter(insight => insight !== undefined);
    
    if (validInsights.length === 0) {
      return [{
        type: "welcome",
        icon: Lightbulb,
        title: "Start tracking to get insights!",
        description: "Complete habits for a few days to see personalized patterns and recommendations.",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      }];
    }

    // Best performing days analysis
    const allDayPatterns: { [key: string]: { completed: number; total: number } } = {};
    validInsights.forEach(insight => {
      if (insight?.dayPatterns) {
        Object.entries(insight.dayPatterns).forEach(([day, stats]) => {
          if (!allDayPatterns[day]) {
            allDayPatterns[day] = { completed: 0, total: 0 };
          }
          allDayPatterns[day].completed += stats.completed;
          allDayPatterns[day].total += stats.total;
        });
      }
    });

    const bestDay = Object.entries(allDayPatterns)
      .map(([day, stats]) => ({
        day,
        rate: stats.total > 0 ? stats.completed / stats.total : 0,
        total: stats.total,
      }))
      .filter(d => d.total >= 3)
      .sort((a, b) => b.rate - a.rate)[0];

    if (bestDay && bestDay.rate > 0.7) {
      insights.push({
        type: "pattern",
        icon: Calendar,
        title: `You're strongest on ${bestDay.day}s!`,
        description: `You complete ${Math.round(bestDay.rate * 100)}% of your habits on ${bestDay.day}s. Consider scheduling important habits on this day.`,
        color: "text-green-600",
        bgColor: "bg-green-50",
      });
    }

    // Mood correlation analysis
    const moodData = validInsights.reduce((acc, insight) => {
      if (insight?.moodStats) {
        Object.entries(insight.moodStats).forEach(([mood, count]) => {
          acc[mood] = (acc[mood] || 0) + count;
        });
      }
      return acc;
    }, {} as { [key: string]: number });

    const totalMoodEntries = Object.values(moodData).reduce((sum, count) => sum + count, 0);
    if (totalMoodEntries >= 5) {
      const happyPercentage = ((moodData.happy || 0) / totalMoodEntries) * 100;
      
      if (happyPercentage >= 70) {
        insights.push({
          type: "mood",
          icon: Heart,
          title: "Habits boost your mood! 💖",
          description: `${Math.round(happyPercentage)}% of your completed habits made you feel happy. Keep up the great work!`,
          color: "text-pink-600",
          bgColor: "bg-pink-50",
        });
      } else if (happyPercentage < 40) {
        insights.push({
          type: "mood",
          icon: Heart,
          title: "Consider adjusting your habits",
          description: "Your habits aren't making you as happy as they could. Try modifying them or adding more enjoyable activities.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        });
      }
    }

    // Streak analysis - get stats for each habit safely
    const habitStats = habits.length > 0 ? habits.map(habit => 
      useQuery(api.checkins.getHabitStats, {
        habitId: habit._id,
        userId: userId,
      })
    ) : [];

    const currentStreaks = habitStats.map(stats => stats?.currentStreak || 0);

    const maxStreak = Math.max(...currentStreaks);
    const activeStreaks = currentStreaks.filter(s => s > 0).length;

    if (maxStreak >= 7) {
      insights.push({
        type: "streak",
        icon: Zap,
        title: `Amazing ${maxStreak}-day streak! 🔥`,
        description: "You're building incredible consistency. Streaks like this create lasting habits!",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      });
    } else if (activeStreaks === 0 && habits.length > 0) {
      insights.push({
        type: "motivation",
        icon: Target,
        title: "Ready for a fresh start?",
        description: "Every expert was once a beginner. Start small today and build momentum!",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      });
    }

    // Completion rate analysis
    const completionRates = validInsights.map(insight => insight?.recentCompletionRate || 0);
    const avgCompletionRate = completionRates.length > 0 
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length 
      : 0;

    if (avgCompletionRate >= 80) {
      insights.push({
        type: "performance",
        icon: TrendingUp,
        title: "You're crushing it! 🚀",
        description: `${Math.round(avgCompletionRate)}% completion rate this month. You're in the top tier of habit builders!`,
        color: "text-green-600",
        bgColor: "bg-green-50",
      });
    } else if (avgCompletionRate < 30 && habits.length > 0) {
      insights.push({
        type: "suggestion",
        icon: Lightbulb,
        title: "Try the 2-minute rule",
        description: "Start with habits that take less than 2 minutes. Small wins build big momentum!",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      });
    }

    // Time-based insights
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 6 && hour <= 10) {
      insights.push({
        type: "timing",
        icon: Clock,
        title: "Perfect morning timing! ☀️",
        description: "Morning habits have the highest success rate. You're setting yourself up for a great day!",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      });
    }

    return insights.slice(0, 3); // Show max 3 insights
  };

  const insights = generateInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Smart Insights
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your habit patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${insight.bgColor} border-opacity-20`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-white ${insight.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${insight.color}`}>
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}