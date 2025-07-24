"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Clock } from "lucide-react";

interface HabitTimerProps {
  onComplete?: () => void;
  defaultMinutes?: number;
}

export function HabitTimer({ onComplete, defaultMinutes = 5 }: HabitTimerProps) {
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(defaultMinutes * 60);
    setIsCompleted(false);
  };

  const progress = ((defaultMinutes * 60 - timeLeft) / (defaultMinutes * 60)) * 100;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">Habit Timer</span>
        </div>
        
        {/* Timer Display */}
        <div className="relative">
          <div className={`text-4xl font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
            {formatTime(timeLeft)}
          </div>
          {isCompleted && (
            <div className="text-green-600 text-sm font-medium mt-1">
              🎉 Time's up! Great job!
            </div>
          )}
        </div>

        {/* Progress Ring */}
        <div className="relative w-20 h-20 mx-auto">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={isCompleted ? "text-green-500" : "text-blue-500"}
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={isCompleted}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Square className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}