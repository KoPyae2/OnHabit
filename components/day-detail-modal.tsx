"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Edit3, 
  Save, 
  X,
  Star,
  ThumbsUp,
  Meh,
  Frown,
  Heart
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  habits: any[];
  checkins: any[];
  userId: Id<"users">;
  onUpdate?: () => void;
}

export function DayDetailModal({ 
  isOpen, 
  onClose, 
  date, 
  habits, 
  checkins, 
  userId,
  onUpdate 
}: DayDetailModalProps) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleCheckin = useMutation(api.checkins.toggleCheckin);
  const updateCheckinNote = useMutation(api.checkins.updateCheckinNote);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const dateStr = formatDate(date);

  const habitData = habits.map(habit => {
    const checkin = checkins.find(c => 
      c.habitId === habit._id && 
      c.date === dateStr &&
      c.userId === userId
    );
    return {
      ...habit,
      checkin,
      completed: checkin?.checked || false,
      note: checkin?.note || "",
      mood: checkin?.mood || null,
    };
  });

  const completedCount = habitData.filter(h => h.completed).length;
  const completionRate = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  const handleToggleHabit = async (habitId: Id<"habits">) => {
    setLoading(true);
    try {
      await toggleCheckin({
        habitId,
        userId,
        date: dateStr,
      });
      onUpdate?.();
      toast.success("Habit updated!");
    } catch (error) {
      toast.error("Failed to update habit");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (checkinId: Id<"checkins">) => {
    if (!noteValue.trim()) return;
    
    setLoading(true);
    try {
      await updateCheckinNote({
        checkinId,
        userId,
        note: noteValue.trim(),
      });
      setEditingNote(null);
      setNoteValue("");
      onUpdate?.();
      toast.success("Note saved!");
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "excellent": return <Star className="h-4 w-4 text-green-500" />;
      case "good": return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case "neutral": return <Meh className="h-4 w-4 text-yellow-500" />;
      case "bad": return <Frown className="h-4 w-4 text-orange-500" />;
      case "terrible": return <Heart className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "excellent": return "bg-green-50 text-green-700 border-green-200";
      case "good": return "bg-blue-50 text-blue-700 border-blue-200";
      case "neutral": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "bad": return "bg-orange-50 text-orange-700 border-orange-200";
      case "terrible": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const isToday = dateStr === formatDate(new Date());
  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto modal-slide-in">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              {isToday && (
                <Badge variant="secondary" className="ml-2">Today</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Progress Overview</h3>
              <Badge 
                variant={completionRate === 100 ? "default" : "secondary"}
                className={completionRate === 100 ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {completedCount}/{habits.length} completed
              </Badge>
            </div>
            <Progress value={completionRate} className="h-3" />
            <p className="text-sm text-gray-600">
              {completionRate === 100 ? "🎉 Perfect day!" : 
               completionRate >= 75 ? "Great progress!" :
               completionRate >= 50 ? "Good effort!" :
               completionRate > 0 ? "Keep going!" : "No habits completed"}
            </p>
          </div>

          {/* Habits List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Habits</h3>
            <div className="space-y-3">
              {habitData.map((habit) => (
                <div
                  key={habit._id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    habit.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleToggleHabit(habit._id)}
                        disabled={loading}
                        className={`mt-1 p-1 rounded-full transition-all duration-200 ${
                          habit.completed 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-green-500'
                        }`}
                      >
                        {habit.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${
                          habit.completed ? 'text-green-800' : 'text-gray-900'
                        }`}>
                          {habit.title || habit.name}
                        </h4>
                        
                        {/* Mood Display */}
                        {habit.mood && (
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getMoodColor(habit.mood)}`}>
                            {getMoodIcon(habit.mood)}
                            <span className="capitalize">{habit.mood}</span>
                          </div>
                        )}
                        
                        {/* Note Display/Edit */}
                        {habit.note && editingNote !== habit._id && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <div className="flex items-start justify-between">
                              <p className="text-sm text-gray-700 flex-1">{habit.note}</p>
                              {habit.completed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingNote(habit._id);
                                    setNoteValue(habit.note);
                                  }}
                                  className="h-6 w-6 p-0 ml-2"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Note Edit Mode */}
                        {editingNote === habit._id && (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              placeholder="Add a note about this habit..."
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(habit.checkin._id)}
                                disabled={loading || !noteValue.trim()}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingNote(null);
                                  setNoteValue("");
                                }}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Add Note Button */}
                        {!habit.note && habit.completed && editingNote !== habit._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingNote(habit._id);
                              setNoteValue("");
                            }}
                            className="mt-2 h-8 text-xs"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Add note
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {habits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No habits found for this date.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}