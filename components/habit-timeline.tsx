"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, Calendar, Flame, TrendingUp, BarChart3, Sparkles, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DayDetailModal } from "@/components/day-detail-modal";
import { HabitAnalytics } from "@/components/habit-analytics";

interface HabitTimelineProps {
  userId: Id<"users">;
  habits: any[];
}

export function HabitTimeline({ userId, habits }: HabitTimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [monthTransition, setMonthTransition] = useState<'left' | 'right' | null>(null);
  
  // Get current month's check-ins
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get all checkins for the current month
  const monthCheckins = useQuery(api.checkins.getMonthCheckins, {
    userId: userId,
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1, // JavaScript months are 0-indexed
  });
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(monthStart);
    const lastDay = new Date(monthEnd);
    
    // Add days from previous month to fill the week
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - (i + 1));
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      days.push({ date: new Date(date), isCurrentMonth: true });
    }
    
    // Add days from next month to fill the week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(lastDay);
      day.setDate(day.getDate() + i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setMonthTransition(direction === 'prev' ? 'left' : 'right');
    
    setTimeout(() => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        return newDate;
      });
      
      setTimeout(() => setMonthTransition(null), 50);
    }, 150);
  };

  const getDayCheckins = (date: Date) => {
    const dateStr = formatDate(date);
    
    if (!monthCheckins) return [];
    
    // Filter checkins for this specific date
    const dayCheckins = monthCheckins.filter(c => c.date === dateStr);
    
    return habits.map(habit => {
      const checkin = dayCheckins.find(c => c.habitId === habit._id);
      return {
        habitId: habit._id,
        habitTitle: habit.title,
        completed: checkin?.checked || false,
        mood: checkin?.mood || null,
      };
    });
  };

  // Calculate month statistics with streaks
  const getMonthStats = () => {
    if (!monthCheckins || habits.length === 0) return { 
      perfectDays: 0, 
      totalCompletion: 0, 
      currentStreak: 0, 
      longestStreak: 0,
      streakBroken: false 
    };
    
    const daysInMonth = monthEnd.getDate();
    const checkinsByDate = monthCheckins.reduce((acc, checkin) => {
      if (!acc[checkin.date]) acc[checkin.date] = [];
      acc[checkin.date].push(checkin);
      return acc;
    }, {} as Record<string, any[]>);
    
    let perfectDays = 0;
    let totalPossibleCheckins = 0;
    let totalCompletedCheckins = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let streakBroken = false;
    
    // Calculate stats and streaks
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const dayCheckins = checkinsByDate[dateStr] || [];
      const completedCount = dayCheckins.filter(c => c.checked).length;
      const isPerfectDay = completedCount === habits.length && habits.length > 0;
      
      totalPossibleCheckins += habits.length;
      totalCompletedCheckins += completedCount;
      
      if (isPerfectDay) {
        perfectDays++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (tempStreak > 0) streakBroken = true;
        tempStreak = 0;
      }
    }
    
    // Current streak is the temp streak if we're still in it
    currentStreak = tempStreak;
    
    const totalCompletion = totalPossibleCheckins > 0 ? (totalCompletedCheckins / totalPossibleCheckins) * 100 : 0;
    
    return { 
      perfectDays, 
      totalCompletion: Math.round(totalCompletion),
      currentStreak,
      longestStreak,
      streakBroken: streakBroken && currentStreak === 0
    };
  };

  const monthStats = getMonthStats();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const weekDaysFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full space-y-6">
      {/* Streak Status Alert */}
      {monthStats.streakBroken && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 bounce-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💔</div>
              <div>
                <p className="font-semibold text-red-800">🔥 Streak Lost</p>
                <p className="text-sm text-red-600">Your perfect day streak was broken. Start a new one today!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Calendar and Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar View</span>
            <span className="sm:hidden">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4 mt-6">

        {/* Calendar Card */}
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Habit Timeline</span>
                  <span className="sm:hidden">Timeline</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Click on any day to see details
                </CardDescription>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-gray-100 transition-all duration-200"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <span className="text-xs sm:text-sm font-semibold min-w-[90px] sm:min-w-[120px] text-center">
                  <span className="hidden sm:inline">{monthNames[currentDate.getMonth()]}</span>
                  <span className="sm:hidden">{monthNames[currentDate.getMonth()].slice(0, 3)}</span>
                  {' '}{currentDate.getFullYear()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-gray-100 transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Calendar Grid */}
              <div className={`grid grid-cols-7 gap-1 sm:gap-2 ${
                monthTransition === 'left' ? 'calendar-slide-in-left' : 
                monthTransition === 'right' ? 'calendar-slide-in-right' : ''
              }`}>
                {/* Week day headers */}
                {weekDays.map((day, index) => (
                  <div key={`weekday-${index}`} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-semibold text-gray-600">
                    <span className="sm:hidden">{day}</span>
                    <span className="hidden sm:inline">{weekDaysFull[index]}</span>
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const dayCheckins = getDayCheckins(day.date);
                  const completedCount = dayCheckins.filter(c => c.completed).length;
                  const totalHabits = habits.length;
                  const completionRate = totalHabits > 0 ? completedCount / totalHabits : 0;
                  const isToday = formatDate(day.date) === formatDate(new Date());
                  const isPerfectDay = completionRate === 1 && totalHabits > 0;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => day.isCurrentMonth && setSelectedDay(day.date)}
                      className={`
                        calendar-cell relative p-1 sm:p-2 min-h-[45px] sm:min-h-[70px] border rounded-lg transition-all duration-300 transform group
                        ${day.isCurrentMonth 
                          ? 'bg-white hover:bg-gray-50 border-gray-200 hover:shadow-lg hover:scale-105 cursor-pointer button-hover-lift' 
                          : 'bg-gray-50 border-gray-100 text-gray-400 cursor-default'
                        }
                        ${isToday ? 'ring-2 ring-blue-400 shadow-md today-pulse' : ''}
                        ${isPerfectDay ? 'bg-gradient-to-br from-green-50 to-green-100 shadow-green-100/50 perfect-day-glow' : ''}
                      `}
                      disabled={!day.isCurrentMonth}
                    >
                      {/* Date number with better visibility */}
                      <div className={`text-sm sm:text-base font-bold ${
                        isToday ? 'text-blue-600' : 
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {day.date.getDate()}
                        {isToday && <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto mt-1"></div>}
                      </div>
                      
                      {/* Progress indicators for current month */}
                      {day.isCurrentMonth && totalHabits > 0 && (
                        <div className="mt-1 space-y-1">
                          {/* Enhanced progress bar with gradient */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 shadow-inner overflow-hidden">
                            <div
                              className={`h-full rounded-full progress-bar-animated ${
                                completionRate === 1 ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg' :
                                completionRate >= 0.7 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md' :
                                completionRate >= 0.4 ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-md' :
                                completionRate > 0 ? 'bg-gradient-to-r from-red-400 to-red-500 shadow-md' : 'bg-gray-200'
                              }`}
                              style={{ 
                                '--progress-width': `${completionRate * 100}%`,
                                width: `${completionRate * 100}%`,
                                transform: completionRate > 0 ? 'scale(1.05)' : 'scale(1)'
                              } as React.CSSProperties}
                            />
                          </div>
                          
                          {/* Habit dots - enhanced with better visibility */}
                          <div className="hidden sm:flex flex-wrap gap-0.5 justify-center">
                            {dayCheckins.slice(0, 6).map((checkin, i) => (
                              <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                  checkin.completed 
                                    ? 'bg-green-500 shadow-lg transform scale-110' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                title={`${checkin.habitTitle}: ${checkin.completed ? 'Completed' : 'Not completed'}`}
                              />
                            ))}
                            {dayCheckins.length > 6 && (
                              <div className="text-[10px] text-gray-500 flex items-center font-medium">
                                +{dayCheckins.length - 6}
                              </div>
                            )}
                          </div>
                          
                          {/* Mobile completion indicator with better styling */}
                          <div className="sm:hidden flex justify-center">
                            {completedCount > 0 && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                {completedCount}/{totalHabits}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Perfect day flame with enhanced animation */}
                      {isPerfectDay && (
                        <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 absolute top-1 right-1 animate-bounce drop-shadow-lg" />
                      )}
                    </button>
                  );
                })}
            </div>
            
            {/* Enhanced Legend */}
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-3 sm:gap-6 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-lg" />
                  <span className="font-medium">All completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-md" />
                  <span className="font-medium">70%+ done</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-md" />
                  <span className="font-medium">Some done</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Flame className="h-3 w-3 text-orange-500 animate-pulse" />
                  <span className="font-medium">Perfect day</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <HabitAnalytics 
          habits={habits} 
          checkins={monthCheckins || []} 
          currentDate={currentDate}
        />
      </TabsContent>
    </Tabs>

    {/* Day Detail Modal */}
    {selectedDay && (
      <DayDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        date={selectedDay}
        habits={habits}
        checkins={monthCheckins || []}
        userId={userId}
        onUpdate={() => {
          // Trigger a refetch of the month checkins
          // This will be handled by Convex's reactivity
        }}
      />
    )}
  </div>
);
}