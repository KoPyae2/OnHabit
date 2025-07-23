"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Id } from "@/convex/_generated/dataModel";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  BarChart3,
  Clock,
  Zap
} from "lucide-react";

interface GoalAnalyticsProps {
  userId: Id<"users">;
}

export function GoalAnalytics({ userId }: GoalAnalyticsProps) {
  const monthlyGoals = useQuery(api.goals.getUserMonthlyGoals, { userId });
  
  if (!monthlyGoals || monthlyGoals.length === 0) {
    return null;
  }

  const completedGoals = monthlyGoals.filter(goal => goal.completed);
  const activeGoals = monthlyGoals.filter(goal => !goal.completed);
  
  // Calculate analytics
  const totalProgress = Math.round((completedGoals.length / monthlyGoals.length) * 100);
  const averageProgress = Math.round(
    monthlyGoals.reduce((sum, goal) => sum + (goal.currentValue / goal.targetValue) * 100, 0) / monthlyGoals.length
  );
  
  const goalsOnTrack = activeGoals.filter(goal => {
    const progress = (goal.currentValue / goal.targetValue) * 100;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysPassed = new Date().getDate();
    const expectedProgress = (daysPassed / daysInMonth) * 100;
    return progress >= expectedProgress * 0.8; // 80% of expected progress
  }).length;

  const analytics = [
    {
      title: "Completion Rate",
      value: `${totalProgress}%`,
      description: `${completedGoals.length} of ${monthlyGoals.length} goals completed`,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      description: "Across all your goals",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "On Track",
      value: `${goalsOnTrack}/${activeGoals.length}`,
      description: "Goals meeting timeline",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Days Remaining",
      value: `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}`,
      description: "To achieve your goals",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Goal Analytics
        </CardTitle>
        <CardDescription>
          Insights into your goal performance this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {analytics.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${item.bgColor} ${item.borderColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <span className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Monthly Progress Overview */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Monthly Progress</h4>
            <span className="text-sm text-gray-600">{totalProgress}% Complete</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Month Start</span>
            <span>Month End</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}