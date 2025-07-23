"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Target, 
  Plus, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
  Award,
  BookOpen,
  Heart,
  Dumbbell
} from "lucide-react";
import { toast } from "sonner";

interface MonthlyGoalsProps {
  userId: Id<"users">;
  habits: any[];
  onShowTemplates?: () => void;
}

export function MonthlyGoals({ userId, habits, onShowTemplates }: MonthlyGoalsProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("check-ins");
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showTemplates, setShowTemplates] = useState(false);

  const createGoal = useMutation(api.goals.createMonthlyGoal);
  const updateGoal = useMutation(api.goals.updateMonthlyGoal);
  const deleteGoal = useMutation(api.goals.deleteMonthlyGoal);
  const updateProgress = useMutation(api.goals.updateGoalProgress);
  const monthlyGoals = useQuery(api.goals.getUserMonthlyGoals, { userId });
  const goalSuggestions = useQuery(api.goals.getGoalSuggestions, { userId });

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !targetValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (editingGoal) {
        await updateGoal({
          goalId: editingGoal._id,
          title: title.trim(),
          description: description.trim(),
          targetValue: parseInt(targetValue),
          unit,
        });
      } else {
        await createGoal({
          userId,
          title: title.trim(),
          description: description.trim(),
          targetValue: parseInt(targetValue),
          unit,
        });
      }
      
      toast.success(editingGoal ? "Goal updated! 🎯" : "Monthly goal created! 🎯");
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteGoal({ goalId: goalId as any });
      toast.success("Goal deleted successfully");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal. Please try again.");
    }
  };

  const useSuggestion = (suggestion: any) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    setTargetValue(suggestion.targetValue.toString());
    setUnit(suggestion.unit);
  };

  const useTemplate = (template: any) => {
    setTitle(template.title);
    setDescription(template.description);
    setTargetValue(template.targetValue.toString());
    setUnit(template.unit);
  };

  // Goal templates
  const goalTemplates = [
    {
      id: "consistency-basic",
      title: "Build Daily Consistency",
      description: "Complete at least one habit every day",
      targetValue: 30,
      unit: "days",
      category: "consistency",
      icon: Calendar,
      color: "text-blue-600",
      difficulty: "Easy"
    },
    {
      id: "streak-week",
      title: "Weekly Streak Master",
      description: "Maintain a 7-day streak on any habit",
      targetValue: 7,
      unit: "consecutive days",
      category: "streaks",
      icon: Flame,
      color: "text-orange-600",
      difficulty: "Medium"
    },
    {
      id: "checkins-50",
      title: "50 Check-ins Challenge",
      description: "Complete 50 habit check-ins this month",
      targetValue: 50,
      unit: "check-ins",
      category: "volume",
      icon: Target,
      color: "text-green-600",
      difficulty: "Medium"
    },
    {
      id: "reading-goal",
      title: "Reading Habit",
      description: "Read for 20 days this month",
      targetValue: 20,
      unit: "reading sessions",
      category: "learning",
      icon: BookOpen,
      color: "text-purple-600",
      difficulty: "Easy"
    },
    {
      id: "wellness-focus",
      title: "Wellness Focus",
      description: "Complete wellness activities 25 times",
      targetValue: 25,
      unit: "wellness activities",
      category: "health",
      icon: Heart,
      color: "text-red-600",
      difficulty: "Medium"
    },
    {
      id: "fitness-challenge",
      title: "Fitness Challenge",
      description: "Complete 20 workout sessions",
      targetValue: 20,
      unit: "workouts",
      category: "fitness",
      icon: Dumbbell,
      color: "text-green-700",
      difficulty: "Medium"
    }
  ];

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getGoalPriority = (goal: any) => {
    const progress = (goal.currentValue / goal.targetValue) * 100;
    if (progress >= 90) return "high";
    if (progress >= 50) return "medium";
    return "low";
  };

  const getGoalIcon = (unit: string) => {
    switch (unit.toLowerCase()) {
      case "check-ins": return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case "days": return <Calendar className="h-4 w-4 text-green-600" />;
      case "streaks": 
      case "consecutive days": return <Flame className="h-4 w-4 text-orange-600" />;
      case "workouts": 
      case "exercises": return <Dumbbell className="h-4 w-4 text-red-600" />;
      case "books": 
      case "reading sessions": return <BookOpen className="h-4 w-4 text-purple-600" />;
      case "wellness activities":
      case "mindful sessions": return <Heart className="h-4 w-4 text-pink-600" />;
      case "habits": return <Zap className="h-4 w-4 text-yellow-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetValue("");
    setUnit("check-ins");
    setEditingGoal(null);
    setShowTemplates(false);
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || "");
    setTargetValue(goal.targetValue.toString());
    setUnit(goal.unit);
    setOpen(true);
  };

  const handleQuickProgress = async (goalId: string, increment: number) => {
    try {
      const goal = monthlyGoals?.find(g => g._id === goalId);
      if (!goal) return;
      
      const newValue = Math.max(0, Math.min(goal.targetValue, goal.currentValue + increment));
      await updateProgress({
        goalId: goalId as any,
        currentValue: newValue,
      });
      
      if (newValue >= goal.targetValue) {
        toast.success("🎉 Goal completed! Amazing work!");
      } else if (increment > 0) {
        toast.success("Progress updated! 📈");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const completedGoals = monthlyGoals?.filter(goal => goal.completed) || [];
  const activeGoals = monthlyGoals?.filter(goal => !goal.completed) || [];


  return (
    <div className="space-y-6">
      {/* Main Goals Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 -mt-6 rounded-t-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="truncate">Monthly Goals</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">
                Set and track your monthly objectives for {getCurrentMonth()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Add Goal</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      {editingGoal ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      {editingGoal ? "Edit Goal" : "Create Goal"}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                      {editingGoal 
                        ? "Update your goal details and target"
                        : "Choose a template or create a custom goal"
                      }
                    </DialogDescription>
                  </DialogHeader>

                  {!editingGoal && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Quick Templates</h3>
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                          {goalTemplates.map((template) => {
                            const Icon = template.icon;
                            return (
                              <Button
                                key={template.id}
                                type="button"
                                variant="outline"
                                onClick={() => useTemplate(template)}
                                className="h-auto p-3 text-left justify-start hover:bg-blue-50"
                              >
                                <div className="flex items-start gap-3 w-full">
                                  <div className="p-1 rounded bg-gray-50">
                                    <Icon className={`h-4 w-4 ${template.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{template.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{template.description}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {template.targetValue} {template.unit} • {template.difficulty}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCreateGoal} className="space-y-4">
                    {/* AI Suggestions for non-editing mode */}
                    {!editingGoal && goalSuggestions && goalSuggestions.length > 0 && !title && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">AI Suggestions:</Label>
                        <div className="space-y-2">
                          {goalSuggestions.slice(0, 2).map((suggestion, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => useSuggestion(suggestion)}
                              className="w-full text-left justify-start h-auto p-3"
                            >
                              <div>
                                <div className="font-medium text-sm">{suggestion.title}</div>
                                <div className="text-xs text-gray-500">{suggestion.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">Goal Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Complete 50 habit check-ins"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Optional: Add more details about your goal"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="target" className="text-sm font-medium">Target Number *</Label>
                          <Input
                            id="target"
                            type="number"
                            placeholder="50"
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                            required
                            min="1"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit" className="text-sm font-medium">Unit</Label>
                          <select
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <optgroup label="📊 General">
                              <option value="check-ins">check-ins</option>
                              <option value="days">days</option>
                              <option value="habits">habits</option>
                            </optgroup>
                            <optgroup label="🔥 Consistency">
                              <option value="streaks">streaks</option>
                              <option value="consecutive days">consecutive days</option>
                            </optgroup>
                            <optgroup label="💪 Fitness">
                              <option value="workouts">workouts</option>
                              <option value="exercises">exercises</option>
                            </optgroup>
                            <optgroup label="📚 Learning">
                              <option value="books">books</option>
                              <option value="reading sessions">reading sessions</option>
                            </optgroup>
                            <optgroup label="🧘 Wellness">
                              <option value="wellness activities">wellness activities</option>
                              <option value="mindful sessions">mindful sessions</option>
                            </optgroup>
                            <optgroup label="🎯 Other">
                              <option value="projects">projects</option>
                              <option value="tasks">tasks</option>
                              <option value="other">other</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpen(false)}
                          className="flex-1 order-2 sm:order-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                        >
                          {loading 
                            ? (editingGoal ? "Updating..." : "Creating...") 
                            : (editingGoal ? "Update" : "Create")
                          }
                        </Button>
                      </div>
                    </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {monthlyGoals && monthlyGoals.length > 0 ? (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Active ({activeGoals.length})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Completed ({completedGoals.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                {activeGoals.length > 0 ? (
                  <div className="space-y-4">
                    {activeGoals.map((goal) => {
                      const progress = (goal.currentValue / goal.targetValue) * 100;
                      const priority = getGoalPriority(goal);
                      
                      return (
                        <div
                          key={goal._id}
                          className="group p-3 sm:p-5 border rounded-xl bg-white hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
                        >
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {getGoalIcon(goal.unit)}
                                <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                  {goal.title}
                                </h3>
                                {priority === "high" && (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                    <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                    <span className="hidden sm:inline">High Priority</span>
                                    <span className="sm:hidden">High</span>
                                  </Badge>
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{goal.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 ml-2">
                              <div className="text-right">
                                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                                  {goal.currentValue}/{goal.targetValue}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">{goal.unit}</div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Goal
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleDeleteGoal(goal._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Goal
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-600 font-medium">Progress</span>
                              <span className="font-bold text-gray-900">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                              <div
                                className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getProgressColor(progress)} shadow-sm`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span className="hidden sm:inline">Started this month</span>
                              <span className="sm:hidden">This month</span>
                              <div className="flex items-center gap-2">
                                <span>{Math.max(0, goal.targetValue - goal.currentValue)} remaining</span>
                                {!goal.completed && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuickProgress(goal._id, -1)}
                                      className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-xs"
                                      disabled={goal.currentValue <= 0}
                                    >
                                      -
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuickProgress(goal._id, 1)}
                                      className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-xs bg-blue-50 hover:bg-blue-100"
                                      disabled={goal.currentValue >= goal.targetValue}
                                    >
                                      +
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Active Goals</h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-4">All your goals are completed! 🎉</p>
                    <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Goal
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedGoals.length > 0 ? (
                  <div className="space-y-4">
                    {completedGoals.map((goal) => (
                      <div
                        key={goal._id}
                        className="group p-3 sm:p-5 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 border-l-4 border-l-green-500"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                              <h3 className="font-semibold text-green-800 text-base sm:text-lg truncate">
                                {goal.title}
                              </h3>
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                <Award className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                <span className="hidden sm:inline">Completed</span>
                                <span className="sm:hidden">Done</span>
                              </Badge>
                            </div>
                            {goal.description && (
                              <p className="text-xs sm:text-sm text-green-700 mb-2 line-clamp-2">{goal.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-lg sm:text-2xl font-bold text-green-600">
                              {goal.currentValue}/{goal.targetValue}
                            </div>
                            <div className="text-xs text-green-600 uppercase tracking-wide">{goal.unit}</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="h-2 bg-green-500 rounded-full w-full shadow-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Completed Goals Yet</h3>
                    <p className="text-sm sm:text-base text-gray-500">Keep working on your active goals to see them here! 💪</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 sm:py-16 px-4">
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-20 h-20 sm:w-32 sm:h-32 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                  <Target className="h-10 w-10 sm:h-16 sm:w-16 text-blue-500" />
                </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Ready to Set Your First Goal? 🎯
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed px-4">
                Transform your daily habits into meaningful achievements. Set monthly goals that inspire you to grow and succeed!
              </p>
              
              <div className="flex flex-col gap-3 sm:gap-4 justify-center max-w-sm mx-auto px-4">
                <Button 
                  onClick={() => setOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Create Goal
                </Button>
              </div>
              
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">💡 <strong>Pro Tips:</strong></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span>Start with achievable targets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span>Connect goals to your habits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span>Track progress daily</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                    <span>Celebrate small wins</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}