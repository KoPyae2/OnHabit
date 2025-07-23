"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { Flame, Users, User, Heart, Meh, Frown, Zap, TrendingUp } from "lucide-react";

interface HabitCardProps {
  habit: {
    _id: Id<"habits">;
    title: string;
    ownerId: Id<"users">;
    coupleId?: Id<"couples">;
    createdAt: number;
    active: boolean;
  };
  userId: Id<"users">;
  todaysCheckins: any[];
}

export function HabitCard({ habit, userId, todaysCheckins }: HabitCardProps) {
  const [showNote, setShowNote] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [note, setNote] = useState("");
  const [selectedMood, setSelectedMood] = useState<"excellent" | "good" | "neutral" | "bad" | "terrible" | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleCheckin = useMutation(api.checkins.toggleCheckin);
  const getHabitStats = useQuery(api.checkins.getHabitStats, {
    habitId: habit._id,
    userId: userId,
  });
  const partnerSync = useQuery(api.checkins.checkPartnerSync, {
    habitId: habit._id,
    userId: userId,
  });
  const habitInsights = useQuery(api.checkins.getHabitInsights, {
    habitId: habit._id,
    userId: userId,
  });

  // Find today's check-in for this habit
  const todaysCheckin = todaysCheckins.find(
    checkin => checkin.habitId === habit._id && checkin.userId === userId
  );

  const isChecked = todaysCheckin?.checked || false;
  const existingNote = todaysCheckin?.note || "";

  const handleToggleCheckin = async () => {
    setLoading(true);
    try {
      await toggleCheckin({
        habitId: habit._id,
        userId: userId,
        note: showNote ? note : undefined,
        mood: selectedMood || undefined,
        syncedWithPartner: partnerSync?.bothCompleted || false,
      });
      
      if (!isChecked) {
        // Check for sync bonus
        if (partnerSync?.bothCompleted) {
          toast.success("🎉 Sync bonus! You and your partner both completed this habit!");
        } else if (partnerSync?.canSync && partnerSync?.partnerCompleted) {
          toast.success(`Great job! ${partnerSync.partnerName} also completed this today! 🤝`);
        } else {
          toast.success("Great job! Keep the streak going! 🔥");
        }
      } else {
        toast.success("Check-in updated!");
      }
      
      // Reset form states
      if (showNote) {
        setShowNote(false);
        setNote("");
      }
      if (showMood) {
        setShowMood(false);
        setSelectedMood(null);
      }
    } catch (error) {
      console.error("Error toggling check-in:", error);
      toast.error("Failed to update check-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isChecked ? "bg-green-50 border-green-200" : "bg-white"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium text-gray-900 ${
                isChecked ? "line-through text-green-600" : ""
              }`}>
                {habit.title}
              </h3>
              {habit.coupleId ? (
                <Users className="h-4 w-4 text-blue-500" />
              ) : (
                <User className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span>Created {formatDate(habit.createdAt)}</span>
              {getHabitStats && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span>{getHabitStats.currentStreak} day streak</span>
                  </div>
                  {getHabitStats.bestStreak > getHabitStats.currentStreak && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                        <span>Best: {getHabitStats.bestStreak}</span>
                      </div>
                    </>
                  )}
                  <span>•</span>
                  <span>{getHabitStats.completionRate}% complete</span>
                  {getHabitStats.averageMood && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getHabitStats.averageMood >= 2.5 ? (
                          <Heart className="h-3 w-3 text-pink-500" />
                        ) : getHabitStats.averageMood >= 2 ? (
                          <Meh className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Frown className="h-3 w-3 text-gray-500" />
                        )}
                        <span>Mood: {getHabitStats.averageMood.toFixed(1)}/3</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleToggleCheckin}
            disabled={loading}
            className="mt-1"
          />
        </div>

        {/* Partner Sync Status */}
        {partnerSync?.canSync && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
            {partnerSync.bothCompleted ? (
              <div className="flex items-center space-x-2 text-blue-700">
                <Zap className="h-4 w-4" />
                <span><strong>Sync Bonus!</strong> Both completed today! 🎉</span>
              </div>
            ) : partnerSync.partnerCompleted ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <Users className="h-4 w-4" />
                <span>{partnerSync.partnerName} completed this today!</span>
              </div>
            ) : partnerSync.userCompleted ? (
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Waiting for {partnerSync.partnerName}...</span>
              </div>
            ) : null}
          </div>
        )}

        {existingNote && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
            <strong>Today's note:</strong> {existingNote}
          </div>
        )}

        {/* Mood display for existing check-in */}
        {todaysCheckin?.mood && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <strong>Today's mood:</strong>
              {todaysCheckin.mood === "excellent" && <span>😄</span>}
              {todaysCheckin.mood === "good" && <span>🙂</span>}
              {todaysCheckin.mood === "neutral" && <span>😐</span>}
              {todaysCheckin.mood === "bad" && <span>🙁</span>}
              {todaysCheckin.mood === "terrible" && <span>😢</span>}
              <span className="capitalize">{todaysCheckin.mood}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {!showNote && !showMood ? (
              <>
                <Button
                  onClick={() => setShowNote(true)}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  {existingNote ? "Edit note" : "Add note"}
                </Button>
                {!isChecked && (
                  <Button
                    onClick={() => setShowMood(true)}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Add mood
                  </Button>
                )}
              </>
            ) : null}
          </div>

          {/* Note input */}
          {showNote && (
            <div className="space-y-2">
              <Textarea
                placeholder="Add a reflection note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                className="text-sm resize-none"
                rows={2}
              />
            </div>
          )}

          {/* Mood selection */}
          {showMood && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">How did this habit make you feel?</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedMood("excellent")}
                  variant={selectedMood === "excellent" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>😄</span>
                  <span>Excellent</span>
                </Button>
                <Button
                  onClick={() => setSelectedMood("good")}
                  variant={selectedMood === "good" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>🙂</span>
                  <span>Good</span>
                </Button>
                <Button
                  onClick={() => setSelectedMood("neutral")}
                  variant={selectedMood === "neutral" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>😐</span>
                  <span>Neutral</span>
                </Button>
                <Button
                  onClick={() => setSelectedMood("bad")}
                  variant={selectedMood === "bad" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>🙁</span>
                  <span>Bad</span>
                </Button>
                <Button
                  onClick={() => setSelectedMood("terrible")}
                  variant={selectedMood === "terrible" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>😢</span>
                  <span>Terrible</span>
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons when forms are open */}
          {(showNote || showMood) && (
            <div className="flex space-x-2">
              <Button
                onClick={handleToggleCheckin}
                disabled={loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Saving..." : "Save & Check In"}
              </Button>
              <Button
                onClick={() => {
                  setShowNote(false);
                  setShowMood(false);
                  setNote("");
                  setSelectedMood(null);
                }}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
