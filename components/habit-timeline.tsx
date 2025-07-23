"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, Calendar, Flame, TrendingUp } from "lucide-react";
import { useState } from "react";

interface HabitTimelineProps {
  userId: Id<"users">;
  habits: any[];
}

export function HabitTimeline({ userId, habits }: HabitTimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
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

  // Calculate month statistics
  const getMonthStats = () => {
    if (!monthCheckins || habits.length === 0) return { perfectDays: 0, totalCompletion: 0 };
    
    const daysInMonth = monthEnd.getDate();
    const checkinsByDate = monthCheckins.reduce((acc, checkin) => {
      if (!acc[checkin.date]) acc[checkin.date] = [];
      acc[checkin.date].push(checkin);
      return acc;
    }, {} as Record<string, any[]>);
    
    let perfectDays = 0;
    let totalPossibleCheckins = 0;
    let totalCompletedCheckins = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const dayCheckins = checkinsByDate[dateStr] || [];
      const completedCount = dayCheckins.filter(c => c.checked).length;
      
      totalPossibleCheckins += habits.length;
      totalCompletedCheckins += completedCount;
      
      if (completedCount === habits.length && habits.length > 0) {
        perfectDays++;
      }
    }
    
    const totalCompletion = totalPossibleCheckins > 0 ? (totalCompletedCheckins / totalPossibleCheckins) * 100 : 0;
    
    return { perfectDays, totalCompletion: Math.round(totalCompletion) };
  };

  const monthStats = getMonthStats();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const weekDaysFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              <div>
                <p className="text-xs sm:text-sm text-orange-600 font-medium">Perfect Days</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-700">{monthStats.perfectDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <div>
                <p className="text-xs sm:text-sm text-green-600 font-medium">Completion</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700">{monthStats.totalCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                Track your progress over time
              </CardDescription>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
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
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                  <div
                    key={index}
                    className={`
                      relative p-1 sm:p-2 min-h-[45px] sm:min-h-[70px] border rounded-lg transition-all duration-200
                      ${day.isCurrentMonth 
                        ? 'bg-white hover:bg-gray-50 border-gray-200' 
                        : 'bg-gray-50 border-gray-100 text-gray-400'
                      }
                      ${isToday ? 'ring-2 ring-blue-400 shadow-md' : ''}
                      ${isPerfectDay ? 'bg-gradient-to-br from-green-50 to-green-100' : ''}
                    `}
                  >
                    {/* Date number */}
                    <div className={`text-xs sm:text-sm font-semibold ${
                      isToday ? 'text-blue-600' : 
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* Progress indicators for current month */}
                    {day.isCurrentMonth && totalHabits > 0 && (
                      <div className="mt-1 space-y-1">
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              completionRate === 1 ? 'bg-green-500 shadow-sm' :
                              completionRate >= 0.7 ? 'bg-yellow-500' :
                              completionRate >= 0.4 ? 'bg-orange-500' :
                              completionRate > 0 ? 'bg-red-400' : 'bg-gray-200'
                            }`}
                            style={{ width: `${completionRate * 100}%` }}
                          />
                        </div>
                        
                        {/* Habit dots - only show on larger screens */}
                        <div className="hidden sm:flex flex-wrap gap-0.5">
                          {dayCheckins.slice(0, 6).map((checkin, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                checkin.completed ? 'bg-green-500 shadow-sm' : 'bg-gray-300'
                              }`}
                              title={`${checkin.habitTitle}: ${checkin.completed ? 'Completed' : 'Not completed'}`}
                            />
                          ))}
                          {dayCheckins.length > 6 && (
                            <div className="text-[10px] text-gray-500 flex items-center">
                              +{dayCheckins.length - 6}
                            </div>
                          )}
                        </div>
                        
                        {/* Mobile completion indicator */}
                        <div className="sm:hidden flex justify-center">
                          {completedCount > 0 && (
                            <div className="text-[10px] font-medium text-gray-600">
                              {completedCount}/{totalHabits}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Perfect day flame */}
                    {isPerfectDay && (
                      <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 absolute top-1 right-1 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="pt-3 sm:pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-2 sm:gap-6 text-xs text-gray-600">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm" />
                  <span>All completed</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>70%+ done</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span>Some done</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span>Perfect day</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}