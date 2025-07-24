"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

interface HabitCalendarModalProps {
  children: React.ReactNode;
  habits?: any[];
  checkins?: any[];
}

export function HabitCalendarModal({ children, habits = [], checkins = [] }: HabitCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLegend, setShowLegend] = useState(false);
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getCompletionForDate = (date: Date) => {
    if (!date) return { completed: 0, total: habits.length };
    
    const dateStr = date.toISOString().split('T')[0];
    const dayCheckins = checkins.filter(c => 
      c.createdAt && new Date(c.createdAt).toISOString().split('T')[0] === dateStr && c.checked
    );
    
    return {
      completed: dayCheckins.length,
      total: habits.length
    };
  };

  const getCompletionColor = (completed: number, total: number) => {
    if (total === 0) return "bg-gray-100";
    const percentage = (completed / total) * 100;
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-green-400";
    if (percentage >= 50) return "bg-yellow-400";
    if (percentage >= 25) return "bg-orange-400";
    if (percentage > 0) return "bg-red-400";
    return "bg-gray-200";
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Habit Calendar
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-base sm:text-lg font-semibold text-center flex-1 px-2">
              <span className="hidden sm:inline">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <span className="sm:hidden">
                {monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
              </span>
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1 sm:py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return <div key={index} className="h-10" />;
                }
                
                const { completed, total } = getCompletionForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-all hover:scale-105 ${
                      getCompletionColor(completed, total)
                    } ${
                      isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    } ${
                      completed > 0 ? 'text-white' : 'text-gray-700'
                    }`}
                    title={`${date.getDate()}: ${completed}/${total} habits completed`}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend - Mobile Optimized with Collapsible */}
          <div className="space-y-2">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-sm font-medium text-gray-700">Completion Rate</h4>
              <div className="sm:hidden">
                {showLegend ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </button>
            
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs transition-all duration-200 ${
              showLegend ? 'block' : 'hidden sm:grid'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded flex-shrink-0"></div>
                <span className="truncate">0%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded flex-shrink-0"></div>
                <span className="truncate">1-24%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded flex-shrink-0"></div>
                <span className="truncate">25-49%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded flex-shrink-0"></div>
                <span className="truncate">50-74%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded flex-shrink-0"></div>
                <span className="truncate">75-99%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0"></div>
                <span className="truncate">100%</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}