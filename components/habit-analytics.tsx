"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  Award,
  AlertTriangle,
  Flame
} from "lucide-react";

interface HabitAnalyticsProps {
  habits: any[];
  checkins: any[];
  currentDate: Date;
}

export function HabitAnalytics({ habits, checkins, currentDate }: HabitAnalyticsProps) {
  const analytics = useMemo(() => {
    if (!checkins || !habits || habits.length === 0) {
      return {
        weeklyData: [],
        monthlyData: [],
        mostConsistent: null,
        leastConsistent: null,
        streaks: {},
        missedDays: 0,
        perfectDays: 0,
        averageCompletion: 0,
        trends: {}
      };
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const today = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Generate weekly data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      const dayCheckins = checkins.filter(c => c.date === dateStr);
      const completedCount = dayCheckins.filter(c => c.checked).length;
      const completionRate = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
      
      weeklyData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedCount,
        total: habits.length,
        completionRate: Math.round(completionRate)
      });
    }

    // Generate monthly data (current month by weeks)
    const monthlyData = [];
    const weeksInMonth = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7);
    
    for (let week = 0; week < weeksInMonth; week++) {
      const weekStart = new Date(monthStart);
      weekStart.setDate(1 + (week * 7) - monthStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Ensure we don't go beyond the current month
      if (weekEnd > monthEnd) weekEnd.setTime(monthEnd.getTime());
      if (weekStart < monthStart) weekStart.setTime(monthStart.getTime());
      
      let weekCompleted = 0;
      let weekTotal = 0;
      
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDate(d);
        const dayCheckins = checkins.filter(c => c.date === dateStr);
        weekCompleted += dayCheckins.filter(c => c.checked).length;
        weekTotal += habits.length;
      }
      
      const weekCompletionRate = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;
      
      monthlyData.push({
        week: week + 1,
        label: `Week ${week + 1}`,
        completed: weekCompleted,
        total: weekTotal,
        completionRate: Math.round(weekCompletionRate)
      });
    }

    // Calculate habit consistency
    const habitStats = habits.map(habit => {
      const habitCheckins = checkins.filter(c => c.habitId === habit._id);
      const completedCheckins = habitCheckins.filter(c => c.checked);
      const completionRate = habitCheckins.length > 0 ? (completedCheckins.length / habitCheckins.length) * 100 : 0;
      
      return {
        ...habit,
        completionRate: Math.round(completionRate),
        totalCheckins: habitCheckins.length,
        completedCheckins: completedCheckins.length
      };
    });

    const mostConsistent = habitStats.reduce((prev, current) => 
      (prev.completionRate > current.completionRate) ? prev : current
    );

    const leastConsistent = habitStats.reduce((prev, current) => 
      (prev.completionRate < current.completionRate) ? prev : current
    );

    // Calculate streaks for each habit
    const streaks: Record<string, { current: number; max: number }> = {};
    habits.forEach(habit => {
      const habitCheckins = checkins
        .filter(c => c.habitId === habit._id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      // Calculate current streak (from today backwards)
      for (let i = 0; i < habitCheckins.length; i++) {
        if (habitCheckins[i].checked) {
          if (i === 0 || currentStreak > 0) currentStreak++;
        } else {
          break;
        }
      }
      
      // Calculate max streak
      habitCheckins.forEach(checkin => {
        if (checkin.checked) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      });
      
      streaks[habit._id] = { current: currentStreak, max: maxStreak };
    });

    // Calculate monthly stats
    const monthCheckins = checkins.filter(c => {
      const checkinDate = new Date(c.date);
      return checkinDate >= monthStart && checkinDate <= monthEnd;
    });

    const checkinsByDate = monthCheckins.reduce((acc, checkin) => {
      if (!acc[checkin.date]) acc[checkin.date] = [];
      acc[checkin.date].push(checkin);
      return acc;
    }, {} as Record<string, any[]>);

    let perfectDays = 0;
    let missedDays = 0;
    let totalPossibleCheckins = 0;
    let totalCompletedCheckins = 0;

    for (let day = 1; day <= monthEnd.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const dayCheckins = checkinsByDate[dateStr] || [];
      const completedCount = dayCheckins.filter((c: any) => c.checked).length;
      
      totalPossibleCheckins += habits.length;
      totalCompletedCheckins += completedCount;
      
      if (completedCount === habits.length && habits.length > 0) {
        perfectDays++;
      } else if (completedCount === 0) {
        missedDays++;
      }
    }

    const averageCompletion = totalPossibleCheckins > 0 ? 
      Math.round((totalCompletedCheckins / totalPossibleCheckins) * 100) : 0;

    return {
      weeklyData,
      monthlyData,
      mostConsistent,
      leastConsistent,
      streaks,
      missedDays,
      perfectDays,
      averageCompletion,
      habitStats
    };
  }, [habits, checkins, currentDate]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-600 bg-purple-50 border-purple-200";
    if (streak >= 14) return "text-green-600 bg-green-50 border-green-200";
    if (streak >= 7) return "text-blue-600 bg-blue-50 border-blue-200";
    if (streak >= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Perfect Days</p>
                <p className="text-2xl font-bold text-green-700">{analytics.perfectDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Avg. Completion</p>
                <p className="text-2xl font-bold text-blue-700">{analytics.averageCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Missed Days</p>
                <p className="text-2xl font-bold text-orange-700">{analytics.missedDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Best Streak</p>
                <p className="text-2xl font-bold text-purple-700">
                  {Math.max(...Object.values(analytics.streaks).map((s: any) => s.max), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
          <CardDescription>Last 7 days completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.weeklyData.map((day, index) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {day.day}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={day.completionRate} 
                    className="h-3"
                  />
                </div>
                <div className="w-16 text-sm text-right">
                  <span className="font-medium">{day.completionRate}%</span>
                </div>
                <div className="w-12 text-xs text-gray-500 text-right">
                  {day.completed}/{day.total}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Progress
          </CardTitle>
          <CardDescription>Weekly breakdown for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyData.map((week) => (
              <div key={week.week} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium text-gray-600">
                  {week.label}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={week.completionRate} 
                    className="h-3"
                  />
                </div>
                <div className="w-16 text-sm text-right">
                  <span className="font-medium">{week.completionRate}%</span>
                </div>
                <div className="w-16 text-xs text-gray-500 text-right">
                  {week.completed}/{week.total}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Habit Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Habit Performance
          </CardTitle>
          <CardDescription>Individual habit statistics and streaks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.habitStats?.map((habit) => {
              const streak = analytics.streaks[habit._id] || { current: 0, max: 0 };
              return (
                <div key={habit._id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{habit.title || habit.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <Progress value={habit.completionRate} className="h-2 w-20" />
                        <span className="text-sm text-gray-600">{habit.completionRate}%</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {habit.completedCheckins}/{habit.totalCheckins} completed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getStreakColor(streak.current)} border`}
                    >
                      <Flame className="h-3 w-3 mr-1" />
                      {streak.current} day streak
                    </Badge>
                    {streak.max > streak.current && (
                      <Badge variant="secondary" className="text-xs">
                        Best: {streak.max}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {analytics.mostConsistent && analytics.leastConsistent && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Most Consistent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900">
                  {analytics.mostConsistent.title || analytics.mostConsistent.name}
                </h4>
                <div className="flex items-center gap-2">
                  <Progress value={analytics.mostConsistent.completionRate} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-green-700">
                    {analytics.mostConsistent.completionRate}%
                  </span>
                </div>
                <p className="text-sm text-green-600">
                  {analytics.mostConsistent.completedCheckins} out of {analytics.mostConsistent.totalCheckins} days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingDown className="h-5 w-5" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-900">
                  {analytics.leastConsistent.title || analytics.leastConsistent.name}
                </h4>
                <div className="flex items-center gap-2">
                  <Progress value={analytics.leastConsistent.completionRate} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-orange-700">
                    {analytics.leastConsistent.completionRate}%
                  </span>
                </div>
                <p className="text-sm text-orange-600">
                  {analytics.leastConsistent.completedCheckins} out of {analytics.leastConsistent.totalCheckins} days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}