"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { TrendingUp, Calendar } from "lucide-react";

interface GoalProgressChartProps {
  userId: Id<"users">;
}

export function GoalProgressChart({ userId }: GoalProgressChartProps) {
  const monthlyGoals = useQuery(api.goals.getUserMonthlyGoals, { userId });
  
  if (!monthlyGoals || monthlyGoals.length === 0) {
    return null;
  }

  // Generate daily progress data for the current month
  const generateDailyProgress = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();
    
    const dailyData = [];
    
    for (let day = 1; day <= Math.min(currentDay, daysInMonth); day++) {
      // Simulate progress - in real app, this would come from actual check-in data
      const expectedProgress = (day / daysInMonth) * 100;
      const actualProgress = Math.min(
        expectedProgress + (Math.random() - 0.5) * 20, // Add some variance
        100
      );
      
      dailyData.push({
        day,
        expected: expectedProgress,
        actual: Math.max(0, actualProgress)
      });
    }
    
    return dailyData;
  };

  const dailyProgress = generateDailyProgress();
  const maxProgress = Math.max(...dailyProgress.map(d => Math.max(d.expected, d.actual)));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Progress Timeline
        </CardTitle>
        <CardDescription>
          Your goal progress throughout the month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Chart */}
          <div className="relative h-32 bg-gradient-to-t from-gray-50 to-white rounded-lg border p-4">
            <div className="flex items-end justify-between h-full">
              {dailyProgress.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 max-w-[20px]">
                  {/* Actual Progress Bar */}
                  <div 
                    className="w-2 bg-blue-500 rounded-t-sm mb-1 transition-all duration-300"
                    style={{ 
                      height: `${(data.actual / maxProgress) * 80}%`,
                      minHeight: data.actual > 0 ? '4px' : '0px'
                    }}
                    title={`Day ${data.day}: ${Math.round(data.actual)}%`}
                  />
                  {/* Expected Progress Line */}
                  <div 
                    className="w-full border-t-2 border-dashed border-gray-300 opacity-50"
                    style={{ 
                      position: 'absolute',
                      bottom: `${20 + (data.expected / maxProgress) * 80}%`,
                      left: `${(index / dailyProgress.length) * 100}%`,
                      width: `${100 / dailyProgress.length}%`
                    }}
                  />
                  {/* Day Label */}
                  <span className="text-xs text-gray-500 mt-1">
                    {data.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Actual Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 border-t-2 border-dashed border-gray-400"></div>
              <span className="text-gray-600">Expected Progress</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(dailyProgress[dailyProgress.length - 1]?.actual || 0)}%
              </div>
              <div className="text-xs text-gray-500">Current Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {dailyProgress.filter(d => d.actual >= d.expected).length}
              </div>
              <div className="text-xs text-gray-500">Days On Track</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
              </div>
              <div className="text-xs text-gray-500">Days Remaining</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}