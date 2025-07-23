"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, Circle, Heart, Meh, Frown, MessageSquare, Smile, Users, Sparkles, Star, ThumbsUp } from "lucide-react";

interface HabitItemTodayProps {
  habit: {
    _id: Id<"habits">;
    title: string;
    name?: string;
    ownerId: Id<"users">;
    coupleId?: Id<"couples">;
    streak?: number;
  };
  userId: Id<"users">;
  todaysCheckins: any[];
  coupleInfo?: any;
  userInfo?: any;
}

export function HabitItemToday({ habit, userId, todaysCheckins, coupleInfo, userInfo }: HabitItemTodayProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [note, setNote] = useState("");
  const [selectedMood, setSelectedMood] = useState<"excellent" | "good" | "neutral" | "bad" | "terrible" | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleCheckin = useMutation(api.checkins.toggleCheckin);
  const updateCheckinNote = useMutation(api.checkins.updateCheckinNote);
  const updateCheckinMood = useMutation(api.checkins.updateCheckinMood);

  // Find today's check-in for this habit
  const checkin = todaysCheckins?.find(c => c.habitId === habit._id && c.userId === userId);
  const isCompleted = checkin?.checked || false;
  const existingNote = checkin?.note || "";
  const existingMood = checkin?.mood;

  // Check if partner completed this habit
  const hasPartnerCompleted = coupleInfo?.hasPartner && todaysCheckins?.some(c => 
    c.habitId === habit._id && c.userId !== userId && c.checked
  );

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleCheckin({
        habitId: habit._id,
        userId: userId,
      });
      
      if (!isCompleted) {
        // Habit completed
        if (hasPartnerCompleted) {
          toast.success("🎉 Sync Bonus! Both completed today!", {
            description: "You and your partner are in sync!",
          });
        } else {
          toast.success("Habit completed! 🎉", {
            description: "Great job building your routine!",
          });
        }
      } else {
        // Habit unchecked
        toast.success("Habit unchecked");
      }
    } catch (error) {
      toast.error("Failed to update habit");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!checkin?._id || !isCompleted) {
      toast.error("Please complete the habit first");
      return;
    }
    
    setLoading(true);
    try {
      await updateCheckinNote({
        checkinId: checkin._id,
        userId: userId,
        note: note,
      });
      
      toast.success("Note saved! 📝");
      setShowNoteInput(false);
      setNote("");
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood || !checkin?._id || !isCompleted) {
      toast.error("Please complete the habit first");
      return;
    }
    
    setLoading(true);
    try {
      await updateCheckinMood({
        checkinId: checkin._id,
        userId: userId,
        mood: selectedMood,
      });
      
      toast.success("Mood saved! 😊");
      setShowMoodInput(false);
      setSelectedMood(null);
    } catch (error) {
      toast.error("Failed to save mood");
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

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "excellent": return "🤩";
      case "good": return "😊";
      case "neutral": return "😐";
      case "bad": return "😕";
      case "terrible": return "😢";
      default: return "";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "excellent": return "text-green-600 bg-green-50 border-green-200";
      case "good": return "text-blue-600 bg-blue-50 border-blue-200";
      case "neutral": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "bad": return "text-orange-600 bg-orange-50 border-orange-200";
      case "terrible": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div 
      className={`p-4 rounded-xl shadow-sm border card-hover transition-all duration-200 ${
        isCompleted 
          ? 'bg-green-50 border-green-200 ring-1 ring-green-200' 
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center flex-shrink-0">
            {isCompleted ? (
              <div className="text-xl">🟢</div>
            ) : (
              <div className="text-xl">⚪</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold tracking-tight truncate ${
              isCompleted ? 'text-green-700' : 'text-gray-900'
            }`}>
              {habit.title || habit.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>{habit.streak || 0}-day streak</span>
              <span>•</span>
              <span>{isCompleted ? '100%' : '0%'} complete</span>
              {existingMood && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {getMoodIcon(existingMood)}
                    <span className="capitalize">{existingMood}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={loading}
          className="flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 min-h-[44px] min-w-[44px]"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          ) : (
            <Circle className="h-7 w-7 text-gray-400 hover:text-green-500" />
          )}
        </button>
      </div>

      

      {/* Partner Updates Section */}
      {coupleInfo?.hasPartner && habit.coupleId && (() => {
        const partnerCheckin = todaysCheckins?.find(c => c.habitId === habit._id && c.userId !== userId);
        const hasPartnerUpdate = partnerCheckin && (partnerCheckin.note || partnerCheckin.mood || partnerCheckin.checked);
        
        if (!hasPartnerUpdate) return null;
        
        return (
          <div className="mt-4 space-y-3">
            {/* Sync Bonus Banner */}
            {isCompleted && partnerCheckin.checked && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 animate-bounce-in">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <p className="text-purple-700 text-sm font-medium">
                    ⚡ Sync Bonus! Both completed today! 🎉
                  </p>
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            )}
            
            {/* Partner's Update */}
            {(partnerCheckin.note || partnerCheckin.mood) && (
              <div>
                {!isCompleted && <h4 className="text-sm font-medium text-gray-700 mb-2">Partner's Update</h4>}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Avatar 
                      src={coupleInfo?.partner?.profileImageUrl || coupleInfo?.partner?.photoUrl}
                      name={coupleInfo?.partner?.displayName || coupleInfo?.partner?.name || "Partner"}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-blue-900 font-medium text-sm">
                          {coupleInfo?.partner?.displayName || coupleInfo?.partner?.name || "Partner"}
                        </p>
                        {partnerCheckin.checked && (
                          <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✓ Completed
                          </div>
                        )}
                        {partnerCheckin.mood && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getMoodColor(partnerCheckin.mood)}`}>
                            <span className="mr-1">{getMoodEmoji(partnerCheckin.mood)}</span>
                            <span className="capitalize">{partnerCheckin.mood}</span>
                          </div>
                        )}
                      </div>
                      {partnerCheckin.note && (
                        <p className="text-blue-700 text-sm">{partnerCheckin.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* User Updates Section */}
      {isCompleted && (existingNote || existingMood) && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Today's Updates</h4>
          
          {/* User's Update */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Avatar 
                src={userInfo?.profileImageUrl || userInfo?.googlePhotoUrl}
                name={userInfo?.displayName || userInfo?.name || "User"}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-green-900 font-medium text-sm">
                    {userInfo?.displayName || userInfo?.name || "You"}
                  </p>
                  {existingMood && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getMoodColor(existingMood)}`}>
                      <span className="mr-1">{getMoodEmoji(existingMood)}</span>
                      <span className="capitalize">{existingMood}</span>
                    </div>
                  )}
                </div>
                {existingNote && (
                  <p className="text-green-700 text-sm">{existingNote}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isCompleted && !showNoteInput && !showMoodInput && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              setNote(existingNote);
              setShowNoteInput(true);
            }}
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-3"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {existingNote ? "Edit note" : "Add note"}
          </Button>
          <Button
            onClick={() => {
              setSelectedMood(existingMood as any);
              setShowMoodInput(true);
            }}
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-3"
          >
            <Smile className="h-3 w-3 mr-1" />
            {existingMood ? "Change mood" : "Add mood"}
          </Button>
        </div>
      )}

      {/* Note Input */}
      {showNoteInput && (
        <div className="mt-4 space-y-3 animate-slide-in">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Add a reflection note
            </label>
            <Textarea
              placeholder="How did this habit go today? Any insights or thoughts..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              className="text-sm resize-none"
              rows={3}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">{note.length}/200 characters</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveNote}
              disabled={loading || !note.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? "Saving..." : "Save Note"}
            </Button>
            <Button
              onClick={() => {
                setShowNoteInput(false);
                setNote("");
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Mood Selection */}
      {showMoodInput && (
        <div className="mt-4 space-y-3 animate-slide-in">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              How did this habit make you feel?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Button
                onClick={() => setSelectedMood("excellent")}
                variant={selectedMood === "excellent" ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-16 text-xs"
              >
                <span className="text-lg">🤩</span>
                <span>Excellent</span>
              </Button>
              <Button
                onClick={() => setSelectedMood("good")}
                variant={selectedMood === "good" ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-16 text-xs"
              >
                <span className="text-lg">😊</span>
                <span>Good</span>
              </Button>
              <Button
                onClick={() => setSelectedMood("neutral")}
                variant={selectedMood === "neutral" ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-16 text-xs"
              >
                <span className="text-lg">😐</span>
                <span>Neutral</span>
              </Button>
              <Button
                onClick={() => setSelectedMood("bad")}
                variant={selectedMood === "bad" ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-16 text-xs"
              >
                <span className="text-lg">😕</span>
                <span>Bad</span>
              </Button>
              <Button
                onClick={() => setSelectedMood("terrible")}
                variant={selectedMood === "terrible" ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-16 text-xs"
              >
                <span className="text-lg">😢</span>
                <span>Terrible</span>
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveMood}
              disabled={loading || !selectedMood}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? "Saving..." : "Save Mood"}
            </Button>
            <Button
              onClick={() => {
                setShowMoodInput(false);
                setSelectedMood(null);
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}