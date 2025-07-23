"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Flame, 
  Calendar, 
  Zap, 
  BookOpen, 
  Heart,
  Brain,
  Dumbbell,
  Coffee,
  Moon
} from "lucide-react";

interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  category: string;
  icon: any;
  color: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
}

export function GoalTemplates({ onSelectTemplate }: GoalTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const templates: GoalTemplate[] = [
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
      id: "perfect-days",
      title: "Perfect Days",
      description: "Complete all habits on 10 different days",
      targetValue: 10,
      unit: "perfect days",
      category: "consistency",
      icon: Zap,
      color: "text-yellow-600",
      difficulty: "Hard"
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
      id: "mindfulness",
      title: "Mindful Month",
      description: "Practice mindfulness for 15 days",
      targetValue: 15,
      unit: "mindful sessions",
      category: "mental",
      icon: Brain,
      color: "text-indigo-600",
      difficulty: "Easy"
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

  const categories = [
    { id: "all", name: "All Templates", icon: Target },
    { id: "consistency", name: "Consistency", icon: Calendar },
    { id: "streaks", name: "Streaks", icon: Flame },
    { id: "volume", name: "Volume", icon: Zap },
    { id: "health", name: "Health", icon: Heart },
    { id: "learning", name: "Learning", icon: BookOpen },
    { id: "mental", name: "Mental", icon: Brain },
    { id: "fitness", name: "Fitness", icon: Dumbbell }
  ];

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Goal Templates
        </CardTitle>
        <CardDescription>
          Quick start with proven goal templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50`}>
                      <Icon className={`h-5 w-5 ${template.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.title}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Target: <span className="font-medium text-gray-900">
                      {template.targetValue} {template.unit}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No templates found for this category.
          </div>
        )}
      </CardContent>
    </Card>
  );
}